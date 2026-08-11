import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import {
  identityDispatcher,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/identity";
import { notifyDispatcher } from "@/lib/notify";

type LineIdentityBody = {
  idToken?: string;
};

export async function POST(request: NextRequest) {
  const visitorUuid = request.cookies.get("visitor_uuid")?.value;
  const body = (await request.json().catch(() => null)) as LineIdentityBody | null;

  if (!visitorUuid || !body?.idToken) {
    return Response.json(
      { error: "Visitor cookie or LINE ID token is missing." },
      { status: 400 },
    );
  }

  try {
    const identity = await identityDispatcher({
      action: "resolve_line_user",
      visitorUuid,
      idToken: body.idToken,
    });
    const existingSessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const existingSession = existingSessionToken
      ? await identityDispatcher({
          action: "resolve_session",
          sessionToken: existingSessionToken,
        })
      : null;
    const session =
      existingSession?.userUuid === identity.userUuid
        ? null
        : await identityDispatcher({
            action: "create_session",
            userUuid: identity.userUuid,
          });
    const greeting = identity.status === "created"
      ? "welcome"
      : session
        ? "welcome_back"
        : "hello";

    await notifyDispatcher({
      level: "info",
      event:
        identity.status === "created"
          ? "line_user_registered"
          : "line_user_resolved",
      data: {
        accountStatus: identity.status,
        loginType: "line",
      },
    });

    if (session) {
      await debugDispatcher({
        event: "identity_session_created",
        data: {
          role: identity.role,
          tier: identity.tier,
        },
      });
    }

    const isLocalDevelopment =
      request.nextUrl.hostname === "localhost" ||
      request.nextUrl.hostname === "127.0.0.1";
    const response = NextResponse.json({
      ok: true,
      displayName: identity.displayName,
      pictureUrl: identity.pictureUrl,
      role: identity.role,
      tier: identity.tier,
      destination:
        identity.role === "admin"
          ? isLocalDevelopment
            ? "/main/admin"
            : "/admin"
          : isLocalDevelopment
            ? "/main"
            : "/",
      loginProvider: "line",
      greeting,
    });

    if (session) {
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
    }

    return response;
  } catch (error) {
    await notifyDispatcher({
      level: "error",
      event: "line_user_registration_failed",
      data: {
        reason: error instanceof Error ? error.message : "unknown_error",
      },
    });

    return Response.json(
      { error: "LINE user registration failed." },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");

  if (error) {
    await debugDispatcher({
      level: "warn",
      event: "line_login_denied",
      data: {
        error,
        description:
          request.nextUrl.searchParams.get("error_description") ?? undefined,
      },
    });

    return Response.json(
      { error: "LINE login was not completed." },
      { status: 401 },
    );
  }

  if (!code || !state) {
    return Response.json(
      { error: "The LINE login callback is missing required parameters." },
      { status: 400 },
    );
  }

  await debugDispatcher({
    event: "line_login_callback_received",
    data: {
      hasCode: true,
      hasState: true,
    },
  });

  return Response.json(
    {
      error: "LINE login token exchange is not connected yet.",
    },
    { status: 501 },
  );
}
