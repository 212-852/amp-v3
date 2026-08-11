import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { debugDispatcher } from "@/lib/debug";
import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

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
