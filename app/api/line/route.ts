import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import {
  identityDispatcher,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
} from "@/lib/identity";
import { notifyDispatcher } from "@/lib/notify";

type LineRequestBody = {
  action?: "start" | "claim";
  idToken?: string;
  returnTo?: string;
  tokenUuid?: string;
  claimToken?: string;
};

type LineTokenResponse = {
  id_token?: string;
  error?: string;
};

const LINE_AUTH_MAX_AGE = 60 * 10;

function createSecret() {
  return `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
}

async function hashSecret(value: string) {
  const hash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );

  return Array.from(new Uint8Array(hash), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function safeReturnTo(value: string | null | undefined) {
  return value?.startsWith("/") && !value.startsWith("//") ? value : "/";
}

function setSessionCookies(
  response: NextResponse,
  session: { sessionToken: string; expiresAt: string },
) {
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
}

async function resolveLineIdentity(visitorUuid: string, idToken: string, nonce?: string) {
  const identity = await identityDispatcher({
    action: "resolve_line_user",
    visitorUuid,
    idToken,
    nonce,
  });

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

  return identity;
}

export async function POST(request: NextRequest) {
  const visitorUuid = request.cookies.get("visitor_uuid")?.value;
  const body = (await request.json().catch(() => null)) as LineRequestBody | null;

  if (body?.action === "start") {
    const channelId = process.env.LINE_LOGIN_CHANNEL_ID;

    if (!visitorUuid || !channelId) {
      await debugDispatcher({
        level: "error",
        event: "line_login_failed",
        data: { reason: "line_login_start_configuration_missing" },
      });
      return Response.json({ error: "LINE login is unavailable." }, { status: 400 });
    }

    try {
      const claimToken = createSecret();
      const stateSecret = createSecret();
      const nonce = createSecret();
      const expiresAt = new Date(Date.now() + LINE_AUTH_MAX_AGE * 1_000).toISOString();
      const authToken = await identityDispatcher({
        action: "create_auth_token",
        visitorUuid,
        tokenHash: await hashSecret(claimToken),
        stateHash: await hashSecret(stateSecret),
        nonce,
        returnTo: safeReturnTo(body.returnTo),
        expiresAt,
      });
      const callbackUrl = `${request.nextUrl.origin}/api/line`;
      const authorizeUrl = new URL("https://access.line.me/oauth2/v2.1/authorize");
      authorizeUrl.search = new URLSearchParams({
        response_type: "code",
        client_id: channelId,
        redirect_uri: callbackUrl,
        state: `${authToken.tokenUuid}.${stateSecret}`,
        scope: "openid profile email",
        nonce,
        bot_prompt: "normal",
      }).toString();

      await debugDispatcher({
        event: "line_login_started",
        data: { entrance: "pwa", handoff: true },
      });

      return Response.json({
        authorizeUrl: authorizeUrl.toString(),
        tokenUuid: authToken.tokenUuid,
        claimToken,
        expiresAt,
      });
    } catch (error) {
      await debugDispatcher({
        level: "error",
        event: "line_login_failed",
        data: {
          reason: error instanceof Error ? error.message : "line_login_start_failed",
        },
      });
      return Response.json({ error: "LINE login could not start." }, { status: 500 });
    }
  }

  if (body?.action === "claim") {
    if (!body.tokenUuid || !body.claimToken) {
      return Response.json({ status: "invalid" }, { status: 400 });
    }

    try {
      const claimed = await identityDispatcher({
        action: "consume_auth_token",
        tokenUuid: body.tokenUuid,
        tokenHash: await hashSecret(body.claimToken),
      });

      if (!claimed) {
        return Response.json({ status: "pending" });
      }

      const identity = await identityDispatcher({
        action: "resolve_session_user",
        userUuid: claimed.userUuid,
      });
      const session = await identityDispatcher({
        action: "create_session",
        userUuid: claimed.userUuid,
      });
      const destination = identity.role === "admin" ? "/admin" : "/";
      const response = NextResponse.json({
        status: "completed",
        identity: {
          displayName: claimed.displayName ?? identity.displayName,
          pictureUrl: claimed.pictureUrl ?? identity.pictureUrl,
          role: identity.role,
          tier: identity.tier,
          destination,
          loginProvider: "line",
          greeting: "welcome_back",
        },
      });
      setSessionCookies(response, session);

      await debugDispatcher({
        event: "line_login_succeeded",
        data: { role: identity.role, tier: identity.tier, entrance: "pwa" },
      });
      return response;
    } catch (error) {
      await debugDispatcher({
        level: "error",
        event: "line_login_failed",
        data: {
          reason: error instanceof Error ? error.message : "line_login_claim_failed",
        },
      });
      return Response.json({ status: "failed" }, { status: 500 });
    }
  }

  if (!visitorUuid || !body?.idToken) {
    return Response.json(
      { error: "Visitor cookie or LINE ID token is missing." },
      { status: 400 },
    );
  }

  try {
    const identity = await resolveLineIdentity(visitorUuid, body.idToken);
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
    const response = NextResponse.json({
      ok: true,
      displayName: identity.displayName,
      pictureUrl: identity.pictureUrl,
      role: identity.role,
      tier: identity.tier,
      destination: identity.role === "admin" ? "/admin" : "/",
      loginProvider: "line",
      greeting: identity.status === "created" ? "welcome" : session ? "welcome_back" : "hello",
    });

    if (session) setSessionCookies(response, session);
    return response;
  } catch (error) {
    await notifyDispatcher({
      level: "error",
      event: "line_user_registration_failed",
      data: { reason: error instanceof Error ? error.message : "unknown_error" },
    });
    return Response.json({ error: "LINE user registration failed." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const error = request.nextUrl.searchParams.get("error");
  const channelId = process.env.LINE_LOGIN_CHANNEL_ID;
  const channelSecret = process.env.LINE_LOGIN_CHANNEL_SECRET;
  const callbackUrl = `${request.nextUrl.origin}/api/line`;

  if (error) {
    await debugDispatcher({ level: "warn", event: "line_login_denied", data: { error } });
    return NextResponse.redirect(new URL("/?line_error=denied", request.url));
  }

  const [tokenUuid, stateSecret] = state?.split(".") ?? [];

  if (!code || !tokenUuid || !stateSecret || !channelId || !channelSecret) {
    await debugDispatcher({
      level: "error",
      event: "line_login_failed",
      data: { reason: "invalid_callback_parameters" },
    });
    return NextResponse.redirect(new URL("/?line_error=callback", request.url));
  }

  try {
    const authToken = await identityDispatcher({
      action: "resolve_auth_token",
      tokenUuid,
      stateHash: await hashSecret(stateSecret),
    });

    if (!authToken) throw new Error("line_auth_token_invalid_or_expired");

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

    const identity = await resolveLineIdentity(
      authToken.visitorUuid,
      token.id_token,
      authToken.nonce,
    );
    const completed = await identityDispatcher({
      action: "complete_auth_token",
      tokenUuid,
      userUuid: identity.userUuid,
      displayName: identity.displayName,
      pictureUrl: identity.pictureUrl,
    });

    if (!completed.completed) throw new Error("line_auth_token_completion_failed");

    await debugDispatcher({
      event: "line_login_callback_completed",
      data: { entrance: "pwa" },
    });

    return new NextResponse(
      `<!doctype html><html lang="ja"><meta name="viewport" content="width=device-width,initial-scale=1"><title>LINE login</title><body style="margin:0;display:grid;place-items:center;min-height:100svh;background:#fff4df;color:#4d3323;font-family:sans-serif;text-align:center"><main><h1>LINEログインを確認しました</h1><p>PET TAXIアプリへ戻ってください。</p><button onclick="window.close()" style="border:0;border-radius:999px;padding:14px 28px;background:#06c755;color:white;font-size:16px">アプリへ戻る</button></main></body></html>`,
      { headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  } catch (reason) {
    await debugDispatcher({
      level: "error",
      event: "line_login_failed",
      data: { reason: reason instanceof Error ? reason.message : "unknown_error" },
    });
    return NextResponse.redirect(new URL("/?line_error=failed", request.url));
  }
}
