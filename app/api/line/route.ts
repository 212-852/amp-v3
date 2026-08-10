import type { NextRequest } from "next/server";

import { debugDispatcher } from "@/lib/debug";

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
