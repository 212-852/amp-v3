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

type LineTokenResponse = {
  id_token?: string;
  error?: string;
  error_description?: string;
};

const LINE_STATE_COOKIE = "line_oauth_state";
const LINE_NONCE_COOKIE = "line_oauth_nonce";
const LINE_RETURN_COOKIE = "line_oauth_return";
const LINE_OAUTH_MAX_AGE = 60 * 10;

function createOAuthValue() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
}

function safeReturnTo(value: string | null) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

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
  const action = request.nextUrl.searchParams.get("action");
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
  const callbackUrl = `${request.nextUrl.origin}/api/line`;

  if (action === "login") {
    if (!channelId || !channelSecret) {
      await debugDispatcher({
        level: "error",
        event: "line_login_failed",
        data: { reason: "line_login_configuration_missing" },
      });
      return NextResponse.redirect(new URL("/?line_error=configuration", request.url));
    }

    const state = createOAuthValue();
    const nonce = createOAuthValue();
    const authorizeUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
    authorizeUrl.search = new URLSearchParams({
      response_type: "code",
      client_id: channelId,
      redirect_uri: callbackUrl,
      state,
      scope: "openid profile email",
      nonce,
      bot_prompt: "normal",
    }).toString();

    const response = NextResponse.redirect(authorizeUrl);
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax" as const,
      path: "/",
      maxAge: LINE_OAUTH_MAX_AGE,
    };
    response.cookies.set(LINE_STATE_COOKIE, state, cookieOptions);
    response.cookies.set(LINE_NONCE_COOKIE, nonce, cookieOptions);
    response.cookies.set(
      LINE_RETURN_COOKIE,
      safeReturnTo(request.nextUrl.searchParams.get("returnTo")),
      cookieOptions,
    );

    await debugDispatcher({ event: "line_login_started", data: { entrance: "pwa" } });
    return response;
  }

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

    return NextResponse.redirect(new URL("/?line_error=denied", request.url));
  }

  const expectedState = request.cookies.get(LINE_STATE_COOKIE)?.value;
  const nonce = request.cookies.get(LINE_NONCE_COOKIE)?.value;
  const visitorUuid = request.cookies.get("visitor_uuid")?.value;

  if (
    !code ||
    !state ||
    !expectedState ||
    state !== expectedState ||
    !nonce ||
    !visitorUuid ||
    !channelId ||
    !channelSecret
  ) {
    await debugDispatcher({
      level: "error",
      event: "line_login_failed",
      data: { reason: "invalid_callback_state_or_configuration" },
    });
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

  try {
    const tokenResponse = await fetch("https://api.line.me/oauth2/v2.1/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: callbackUrl,
        client_id: channelId,
        client_secret: channelSecret,
      }),
      cache: "no-store",
    });
    const token = (await tokenResponse.json()) as LineTokenResponse;

    if (!tokenResponse.ok || !token.id_token) {
      throw new Error(token.error ?? "line_token_exchange_failed");
    }

    const identity = await identityDispatcher({
      action: "resolve_line_user",
      visitorUuid,
      idToken: token.id_token,
      nonce,
    });
    const session = await identityDispatcher({
      action: "create_session",
      userUuid: identity.userUuid,
    });
    const returnTo = safeReturnTo(request.cookies.get(LINE_RETURN_COOKIE)?.value ?? null);
    const destination = identity.role === "admin" ? "/admin" : returnTo;
    const response = NextResponse.redirect(new URL(destination, request.nextUrl.origin));

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
      value: "line",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    response.cookies.delete(LINE_STATE_COOKIE);
    response.cookies.delete(LINE_NONCE_COOKIE);
    response.cookies.delete(LINE_RETURN_COOKIE);

    await debugDispatcher({
      event: "line_login_succeeded",
      data: { role: identity.role, tier: identity.tier, entrance: "pwa" },
    });
    return response;
  } catch (reason) {
    await debugDispatcher({
      level: "error",
      event: "line_login_failed",
      data: {
        reason: reason instanceof Error ? reason.message : "unknown_error",
      },
    });
    return NextResponse.redirect(new URL("/?line_error=failed", request.url));
  }
}
