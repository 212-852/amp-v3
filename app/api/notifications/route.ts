import type { NextRequest } from "next/server";

import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";
import { getInboxUnreadCount } from "@/lib/inbox";
import {
  deletePushSubscriptions,
  getNotifications,
  getNotificationChannels,
  getNotificationPreferences,
  getUnreadNotificationCount,
  isNotificationUuid,
  markNotificationRead,
  savePushSubscription,
  type NotificationTopics,
  updateNotificationPreferences,
  updateNotificationTopics,
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
    const [notifications, unreadCount, messageUnreadCount, storedPreferences, linkedChannels] = await Promise.all([
      getNotifications({
        userUuid: identity.userUuid,
        language: identity.language,
        limit,
      }),
      getUnreadNotificationCount(identity.userUuid),
      getInboxUnreadCount(identity.userUuid),
      getNotificationPreferences(identity.userUuid),
      getNotificationChannels(identity.userUuid),
    ]);

    const channels = identity.role === "admin"
      ? { line: linkedChannels.line, google: false, email: false }
      : linkedChannels;
    return noStoreJson({ notifications, unreadCount, messageUnreadCount, preferences: storedPreferences, channels });
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
    primary?: unknown;
    subscription?: {
      endpoint?: unknown;
      keys?: { p256dh?: unknown; auth?: unknown };
    };
    topics?: Partial<NotificationTopics>;
  } | null;

  const hasNotificationUuid = isNotificationUuid(body?.notificationUuid);
  const hasPreferences = body?.primary === "push" || body?.primary === "line" || body?.primary === "email";
  const topicKeys = ["email", "chat", "group", "flight", "company", "critical"] as const;
  const hasTopics = body?.topics && topicKeys.every((key) => typeof body.topics?.[key] === "boolean");

  if (!hasNotificationUuid && !hasPreferences && !hasTopics) {
    return noStoreJson(
      { error: "Notification request is invalid." },
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

    if (hasPreferences) {
      const linkedChannels = await getNotificationChannels(identity.userUuid);
      const channels = identity.role === "admin"
        ? { line: linkedChannels.line, google: false, email: false }
        : linkedChannels;
      const primary = body!.primary as "push" | "line" | "email";
      if ((primary === "line" && !channels.line) || (primary === "email" && !channels.google && !channels.email)) {
        return noStoreJson({ error: "Notification channel is not linked." }, { status: 400 });
      }

      if (primary === "push") {
        const subscription = body?.subscription;
        if (typeof subscription?.endpoint !== "string" || typeof subscription.keys?.p256dh !== "string" || typeof subscription.keys?.auth !== "string") {
          return noStoreJson({ error: "Push subscription is required." }, { status: 400 });
        }
        await savePushSubscription({
          userUuid: identity.userUuid,
          subscription: {
            endpoint: subscription.endpoint,
            keys: { p256dh: subscription.keys.p256dh, auth: subscription.keys.auth },
          },
          userAgent: request.headers.get("user-agent"),
        });
      } else {
        await deletePushSubscriptions(identity.userUuid);
      }

      const preferences = await updateNotificationPreferences({
        userUuid: identity.userUuid,
        primary,
      });

      return noStoreJson({ preferences });
    }

    if (hasTopics) {
      const topics = { ...body!.topics } as NotificationTopics;
      if (identity.tier !== "owner" && identity.tier !== "core") {
        const current = await getNotificationPreferences(identity.userUuid);
        topics.flight = current.topics.flight;
        topics.company = current.topics.company;
      }
      return noStoreJson({ topics: await updateNotificationTopics({ userUuid: identity.userUuid, topics }) });
    }

    await markNotificationRead({ userUuid: identity.userUuid, notificationUuid: body!.notificationUuid as string });

    return noStoreJson({ read: true });
  } catch {
    return noStoreJson(
      { error: "Notification could not be marked as read." },
      { status: 500 },
    );
  }
}
