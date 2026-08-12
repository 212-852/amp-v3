import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import {
  identityDispatcher,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/identity";

type GoogleRequest =
  | { action: "start" }
  | { action: "fail"; reason?: string }
  | { action: "resolve"; accessToken?: string };

function getDestination(role: string, request: NextRequest) {
  const isLocalDevelopment =
    request.nextUrl.hostname === "localhost" ||
    request.nextUrl.hostname === "127.0.0.1";

  return role === "admin"
    ? isLocalDevelopment
      ? "/main/admin"
      : "/admin"
    : isLocalDevelopment
      ? "/main"
      : "/";
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as GoogleRequest | null;

  if (body?.action === "start") {
    await debugDispatcher({ event: "google_login_started" });
    return Response.json({ ok: true });
  }

  if (body?.action === "fail") {
    await debugDispatcher({
      level: "error",
      event: "google_login_failed",
      data: { reason: body.reason ?? "unknown_error" },
    });
    return Response.json({ ok: true });
  }

  const visitorUuid = request.cookies.get("visitor_uuid")?.value;

  if (body?.action !== "resolve" || !visitorUuid || !body.accessToken) {
    await debugDispatcher({
      level: "error",
      event: "google_login_failed",
      data: { reason: "missing_identity_data" },
    });
    return Response.json({ error: "Google identity data is missing." }, { status: 400 });
  }

  try {
    const identity = await identityDispatcher({
      action: "resolve_google_user",
      visitorUuid,
      accessToken: body.accessToken,
    });
    const existingSessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const existingSession = existingSessionToken
      ? await identityDispatcher({
          action: "resolve_session",
          sessionToken: existingSessionToken,
        })
      : null;
    const reusedSession = existingSession?.userUuid === identity.userUuid;
    const session = reusedSession
      ? {
          sessionToken: existingSessionToken as string,
          expiresAt: existingSession.expiresAt,
        }
      : await identityDispatcher({
            action: "create_session",
            userUuid: identity.userUuid,
          });
    const greeting = identity.status === "created"
      ? "welcome"
      : !reusedSession
        ? "welcome_back"
        : "hello";
    const response = NextResponse.json({
      ok: true,
      displayName: identity.displayName,
      pictureUrl: identity.pictureUrl,
      role: identity.role,
      tier: identity.tier,
      language: identity.language,
      destination: getDestination(identity.role, request),
      loginProvider: "google",
      greeting,
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: session.sessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
      expires: new Date(session.expiresAt),
    });
    response.cookies.set({
      name: "login_provider",
      value: "google",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });

    await debugDispatcher({
      event: "google_login_succeeded",
      data: {
        accountStatus: identity.status,
        role: identity.role,
        tier: identity.tier,
      },
    });

    return response;
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "google_login_failed",
      data: {
        reason: error instanceof Error ? error.message : "unknown_error",
      },
    });
    return Response.json({ error: "Google login failed." }, { status: 500 });
  }
}
