import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import {
  identityDispatcher,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/identity";

type EmailRequest =
  | { action: "start" }
  | { action: "fail"; reason?: string }
  | { action: "resolve"; accessToken?: string };

function getDestination(role: string, request: NextRequest) {
  const local = ["localhost", "127.0.0.1"].includes(request.nextUrl.hostname);
  return role === "admin" ? (local ? "/main/admin" : "/admin") : local ? "/main" : "/";
}

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => null)) as EmailRequest | null;

  if (body?.action === "start") {
    await debugDispatcher({ event: "email_login_started" });
    return Response.json({ ok: true });
  }

  if (body?.action === "fail") {
    await debugDispatcher({
      level: "error",
      event: "email_login_failed",
      data: { reason: body.reason ?? "unknown_error" },
    });
    return Response.json({ ok: true });
  }

  const visitorUuid = request.cookies.get("visitor_uuid")?.value;
  if (body?.action !== "resolve" || !visitorUuid || !body.accessToken) {
    await debugDispatcher({
      level: "error",
      event: "email_login_failed",
      data: { reason: "missing_identity_data" },
    });
    return Response.json({ error: "Email identity data is missing." }, { status: 400 });
  }

  try {
    const identity = await identityDispatcher({
      action: "resolve_email_user",
      visitorUuid,
      accessToken: body.accessToken,
    });
    const oldToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const oldSession = oldToken
      ? await identityDispatcher({ action: "resolve_session", sessionToken: oldToken })
      : null;
    const reusedSession = oldSession?.userUuid === identity.userUuid;
    const session = reusedSession
      ? {
          sessionToken: oldToken as string,
          expiresAt: oldSession.expiresAt,
        }
      : await identityDispatcher({ action: "create_session", userUuid: identity.userUuid });
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
      destination: getDestination(identity.role, request),
      loginProvider: "email",
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

    await debugDispatcher({
      event: "email_login_succeeded",
      data: { accountStatus: identity.status, role: identity.role, tier: identity.tier },
    });
    return response;
  } catch (error) {
    await debugDispatcher({
      level: "error",
      event: "email_login_failed",
      data: { reason: error instanceof Error ? error.message : "unknown_error" },
    });
    return Response.json({ error: "Email login failed." }, { status: 500 });
  }
}
