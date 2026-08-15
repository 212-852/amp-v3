import type { NextRequest } from "next/server";

import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";
import {
  getNotifications,
  getUnreadNotificationCount,
  isNotificationUuid,
  markNotificationRead,
} from "@/lib/notification";

function noStoreJson(body: unknown, init?: ResponseInit) {
  const headers = new Headers(init?.headers);
  headers.set("Cache-Control", "private, no-store");

  return Response.json(body, { ...init, headers });
}

async function getIdentity(request: NextRequest) {
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionToken) {
    return null;
  }

  return identityDispatcher({
    action: "resolve_session",
    sessionToken,
  });
}

export async function GET(request: NextRequest) {
  try {
    const identity = await getIdentity(request);

    if (!identity) {
      return noStoreJson(
        { error: "Authentication is required." },
        { status: 401 },
      );
    }

    const requestedLimit = Number(request.nextUrl.searchParams.get("limit") ?? 20);
    const limit = Number.isInteger(requestedLimit) ? requestedLimit : 20;
    const [notifications, unreadCount] = await Promise.all([
      getNotifications({
        userUuid: identity.userUuid,
        language: identity.language,
        limit,
      }),
      getUnreadNotificationCount(identity.userUuid),
    ]);

    return noStoreJson({ notifications, unreadCount });
  } catch {
    return noStoreJson(
      { error: "Notifications are unavailable." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (origin && origin !== request.nextUrl.origin) {
    return noStoreJson({ error: "Forbidden." }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    notificationUuid?: unknown;
  } | null;

  if (!isNotificationUuid(body?.notificationUuid)) {
    return noStoreJson(
      { error: "Notification UUID is invalid." },
      { status: 400 },
    );
  }

  try {
    const identity = await getIdentity(request);

    if (!identity) {
      return noStoreJson(
        { error: "Authentication is required." },
        { status: 401 },
      );
    }

    await markNotificationRead({
      userUuid: identity.userUuid,
      notificationUuid: body.notificationUuid,
    });

    return noStoreJson({ read: true });
  } catch {
    return noStoreJson(
      { error: "Notification could not be marked as read." },
      { status: 500 },
    );
  }
}
