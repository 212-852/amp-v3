import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import { isSupportedLanguage } from "@/lib/i18n";
import {
  identityDispatcher,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/identity";

export async function GET(request: NextRequest) {
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
    language?: unknown;
  } | null;

  if (!sessionToken) {
    return Response.json({ error: "Authentication is required." }, { status: 401 });
  }

  if (!isSupportedLanguage(body?.language)) {
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

export async function DELETE(request: NextRequest) {
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
