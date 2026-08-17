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

  if (resource === "config") {
    try {
      return Response.json(await identityDispatcher({ action: "get_app_config" }));
    } catch {
      return Response.json({ error: "Application configuration is unavailable." }, { status: 500 });
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

  if (resource === "copyright") {
    try {
      const copyright = await identityDispatcher({ action: "get_copyright_config" });
      return Response.json({ copyright });
    } catch {
      return Response.json({ error: "Copyright configuration is unavailable." }, { status: 500 });
    }
  }

  if (resource === "structured") {
    try {
      const structured = await identityDispatcher({ action: "get_structured_config" });
      return Response.json({ structured });
    } catch {
      return Response.json({ error: "Structured data configuration is unavailable." }, { status: 500 });
    }
  }

  if (resource === "countries") {
    try {
      const countries = await identityDispatcher({ action: "get_countries_config" });
      return Response.json({ countries });
    } catch {
      return Response.json({ error: "Countries configuration is unavailable." }, { status: 500 });
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
    copyright?: unknown;
    structured?: unknown;
    countries?: unknown;
  } | null;

  if (body?.resource === "countries") {
    const countries = body.countries;
    const isLocalizedText = (value: unknown) =>
      Boolean(value) &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.values(value as Record<string, unknown>).every((item) => typeof item === "string");
    const validCountries = Array.isArray(countries) && countries.every((entry) => {
      if (!entry || typeof entry !== "object" || Array.isArray(entry)) return false;
      const item = entry as Record<string, unknown>;
      return typeof item.code === "string" && /^[A-Za-z]{2}$/.test(item.code) &&
        isLocalizedText(item.name) &&
        ["northAmerica", "europe", "asia", "oceania", "other"].includes(String(item.region)) &&
        ["active", "consult", "paused"].includes(String(item.status)) &&
        typeof item.featured === "boolean" &&
        Number.isFinite(item.sortOrder) &&
        isLocalizedText(item.note) &&
        typeof item.url === "string";
    });

    if (!validCountries) {
      return Response.json({ error: "Invalid countries configuration." }, { status: 400 });
    }

    try {
      if (!(await requireLanguageAdministrator(request))) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
      }
      const updatedCountries = await identityDispatcher({
        action: "update_countries_config",
        countries: countries as import("@/lib/content").CountriesConfig,
      });
      return Response.json({ countries: updatedCountries });
    } catch {
      return Response.json({ error: "Countries configuration could not be saved." }, { status: 500 });
    }
  }

  if (body?.resource === "structured") {
    const structured = body.structured;
    const isLocalizedText = (value: unknown) =>
      Boolean(value) &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      Object.values(value as Record<string, unknown>).every((item) => typeof item === "string");
    const validStructured =
      structured &&
      typeof structured === "object" &&
      !Array.isArray(structured) &&
      ["main", "tokyo", "airport", "corporate", "flight"].every((service) => {
        const item = (structured as Record<string, unknown>)[service];
        if (!item || typeof item !== "object" || Array.isArray(item)) return false;
        const record = item as Record<string, unknown>;
        return typeof record.enabled === "boolean" &&
          typeof record.url === "string" &&
          typeof record.image === "string" &&
          isLocalizedText(record.description) &&
          isLocalizedText(record.category) &&
          isLocalizedText(record.area) &&
          isLocalizedText(record.offering);
      });

    if (!validStructured) {
      return Response.json({ error: "Invalid structured data configuration." }, { status: 400 });
    }

    try {
      if (!(await requireLanguageAdministrator(request))) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
      }
      const updatedStructured = await identityDispatcher({
        action: "update_structured_config",
        structured: structured as import("@/lib/content").StructuredConfig,
      });
      return Response.json({ structured: updatedStructured });
    } catch {
      return Response.json({ error: "Structured data configuration could not be saved." }, { status: 500 });
    }
  }

  if (body?.resource === "copyright") {
    const copyright = body.copyright as {
      startYear?: unknown;
      services?: unknown;
    } | null;
    const validServices =
      copyright?.services &&
      typeof copyright.services === "object" &&
      !Array.isArray(copyright.services) &&
      ["main", "tokyo", "airport", "corporate", "flight"].every((service) => {
        const item = (copyright.services as Record<string, unknown>)[service];
        return Boolean(item) && typeof item === "object" && !Array.isArray(item) &&
          Object.values(item as Record<string, unknown>).every((value) => typeof value === "string");
      });

    if (!Number.isInteger(copyright?.startYear) || Number(copyright?.startYear) < 1900 || Number(copyright?.startYear) > new Date().getFullYear() || !validServices) {
      return Response.json({ error: "Invalid copyright configuration." }, { status: 400 });
    }

    try {
      if (!(await requireLanguageAdministrator(request))) {
        return Response.json({ error: "Forbidden." }, { status: 403 });
      }
      const updatedCopyright = await identityDispatcher({
        action: "update_copyright_config",
        copyright: copyright as import("@/lib/content").CopyrightConfig,
      });
      return Response.json({ copyright: updatedCopyright });
    } catch {
      return Response.json({ error: "Copyright configuration could not be saved." }, { status: 500 });
    }
  }

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
      isLocalizedText(address.detail);

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
            detail: address!.detail as Record<string, string>,
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

export async function POST(request: NextRequest) {
  if (request.nextUrl.searchParams.get("resource") !== "structured-image") {
    return Response.json({ error: "Unsupported resource." }, { status: 404 });
  }

  try {
    if (!(await requireLanguageAdministrator(request))) {
      return Response.json({ error: "Forbidden." }, { status: 403 });
    }

    const formData = await request.formData();
    const service = formData.get("service");
    const image = formData.get("image");
    const services = ["main", "tokyo", "airport", "corporate", "flight"] as const;
    const contentTypes = ["image/jpeg", "image/png", "image/webp"] as const;

    if (
      typeof service !== "string" ||
      !services.some((item) => item === service) ||
      !(image instanceof File) ||
      !contentTypes.some((item) => item === image.type) ||
      image.size === 0 ||
      image.size > 5 * 1024 * 1024
    ) {
      return Response.json({ error: "JPEG・PNG・WebP（5MB以下）を選択してください。" }, { status: 400 });
    }

    return Response.json(
      await identityDispatcher({
        action: "upload_structured_image",
        service: service as import("@/lib/content").ServiceId,
        contentType: image.type as "image/jpeg" | "image/png" | "image/webp",
        data: await image.arrayBuffer(),
      }),
    );
  } catch {
    return Response.json({ error: "画像をアップロードできませんでした。" }, { status: 500 });
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
