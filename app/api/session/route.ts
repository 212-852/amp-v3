import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import { defaultLanguageOptions, isLanguageCode } from "@/lib/i18n";
import {
  identityDispatcher,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/identity";

export async function GET(request: NextRequest) {
  const resource = request.nextUrl.searchParams.get("resource");

  if (resource === "prefectures" || resource === "cities") {
    const language = request.nextUrl.searchParams.get("language");
    const prefectureCode = request.nextUrl.searchParams.get("prefecture") ?? undefined;
    if (
      (language !== "ja" && language !== "en") ||
      (resource === "cities" && !prefectureCode)
    ) {
      return Response.json({ error: "Invalid place query." }, { status: 400 });
    }
    try {
      const places = await identityDispatcher({
        action: "list_places",
        placeType: resource,
        language,
        prefectureCode,
      });
      return Response.json({ places });
    } catch {
      return Response.json({ error: "Places are unavailable." }, { status: 500 });
    }
  }

  if (resource === "languages") {
    try {
      const languages = await identityDispatcher({ action: "list_supported_languages" });
      return Response.json({ languages });
    } catch {
      return Response.json({ languages: defaultLanguageOptions });
    }
  }

  if (resource === "company") {
    try {
      const company = await identityDispatcher({ action: "get_company_config" });
      return Response.json({ company });
    } catch {
      return Response.json({ error: "Company configuration is unavailable." }, { status: 500 });
    }
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const loginProvider = request.cookies.get("login_provider")?.value;

  if (
    !sessionToken ||
    (loginProvider !== "line" &&
      loginProvider !== "google" &&
      loginProvider !== "email")
  ) {
    return Response.json({ identity: null });
  }

  try {
    const identity = await identityDispatcher({
      action: "resolve_session",
      sessionToken,
      loginType: loginProvider,
    });

    const response = NextResponse.json({
      identity: identity
        ? {
            displayName: identity.displayName,
            pictureUrl: identity.pictureUrl,
            role: identity.role,
            tier: identity.tier,
            language: identity.language,
            destination: identity.role === "admin" ? "/admin" : "/",
            loginProvider,
            greeting: "hello",
          }
        : null,
    });

    if (identity) {
      response.cookies.set({
        name: SESSION_COOKIE_NAME,
        value: sessionToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
        expires: new Date(identity.expiresAt),
      });
      response.cookies.set({
        name: "login_provider",
        value: loginProvider,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });
    }

    return response;
  } catch {
    return Response.json({ identity: null }, { status: 401 });
  }
}

export async function PATCH(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const body = (await request.json().catch(() => null)) as {
    resource?: unknown;
    language?: unknown;
    company?: unknown;
  } | null;

  if (body?.resource === "company") {
    if (!body.company || typeof body.company !== "object" || Array.isArray(body.company)) {
      return Response.json({ error: "Invalid company configuration." }, { status: 400 });
    }

    const company = body.company as {
      name?: unknown;
      address?: unknown;
    };
    const isLocalizedText = (value: unknown) =>
      Boolean(value) &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.values(value as Record<string, unknown>).every(
        (item) => typeof item === "string",
      );

    const address = company.address as Record<string, unknown> | undefined;
    const isAddress =
      Boolean(address) &&
      !Array.isArray(address) &&
      typeof address?.prefectureCode === "string" &&
      typeof address.cityCode === "string" &&
      typeof address.detail === "string";

    if (!isLocalizedText(company.name) || !isAddress) {
      return Response.json({ error: "Invalid company configuration." }, { status: 400 });
    }

    try {
      if (!(await requireLanguageAdministrator(request))) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
      }
      const updatedCompany = await identityDispatcher({
        action: "update_company_config",
        company: {
          name: company.name as Record<string, string>,
          address: {
            prefectureCode: address!.prefectureCode as string,
            cityCode: address!.cityCode as string,
            detail: address!.detail as string,
          },
        },
      });
      return Response.json({ company: updatedCompany });
    } catch {
      return Response.json({ error: "Company configuration could not be saved." }, { status: 500 });
    }
  }

  if (!sessionToken) {
    return Response.json({ error: "Authentication is required." }, { status: 401 });
  }

  if (!isLanguageCode(body?.language)) {
    return Response.json({ error: "Unsupported language." }, { status: 400 });
  }

  try {
    const result = await identityDispatcher({
      action: "update_session_language",
      sessionToken,
      language: body.language,
    });

    return Response.json(result);
  } catch {
    return Response.json({ error: "Language update failed." }, { status: 401 });
  }
}

async function requireLanguageAdministrator(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionToken) return null;
  const identity = await identityDispatcher({ action: "resolve_session", sessionToken });
  return identity?.role === "admin" && ["owner", "core"].includes(identity.tier)
    ? identity
    : null;
}

export async function PUT(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as {
    code?: unknown;
    name?: unknown;
  } | null;

  if (!isLanguageCode(body?.code) || typeof body?.name !== "string" || !body.name.trim()) {
    return Response.json({ error: "Invalid language." }, { status: 400 });
  }

  try {
    if (!(await requireLanguageAdministrator(request))) {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }
    const language = await identityDispatcher({
      action: "add_supported_language",
      language: body.code,
      displayName: body.name.trim(),
    });
    return Response.json({ language });
  } catch {
    return Response.json({ error: "Language could not be added." }, { status: 409 });
  }
}

export async function DELETE(request: NextRequest) {
  if (request.nextUrl.searchParams.get("resource") === "language") {
    const language = request.nextUrl.searchParams.get("code");
    if (!isLanguageCode(language)) {
      return Response.json({ error: "Invalid language." }, { status: 400 });
    }
    try {
      if (!(await requireLanguageAdministrator(request))) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
      }
      return Response.json(
        await identityDispatcher({ action: "remove_supported_language", language }),
      );
    } catch {
      return Response.json({ error: "Language is in use or cannot be removed." }, { status: 409 });
    }
  }

  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  try {
    if (sessionToken) {
      await identityDispatcher({
        action: "revoke_session",
        sessionToken,
      });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 0,
    });
    response.cookies.delete("login_provider");

    await debugDispatcher({ event: "logout_succeeded" });
    return response;
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "logout_failed",
      data: {
        reason: error instanceof Error ? error.message : "unknown_error",
      },
    });
    return Response.json({ error: "Logout failed." }, { status: 500 });
  }
}
