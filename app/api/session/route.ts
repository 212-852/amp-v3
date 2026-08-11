import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

export async function GET(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const loginProvider = request.cookies.get("login_provider")?.value;

  if (!sessionToken || loginProvider !== "line") {
    return Response.json({ identity: null });
  }

  try {
    const identity = await identityDispatcher({
      action: "resolve_session",
      sessionToken,
    });

    return Response.json({
      identity: identity
        ? {
            displayName: identity.displayName,
            pictureUrl: identity.pictureUrl,
            role: identity.role,
            tier: identity.tier,
            destination: identity.role === "admin" ? "/admin" : "/",
            loginProvider: "line",
            greeting: "hello",
          }
        : null,
    });
  } catch {
    return Response.json({ identity: null }, { status: 401 });
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
