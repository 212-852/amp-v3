import "server-only";

import { createClient } from "@supabase/supabase-js";
import webPush from "web-push";

import {
  getTranslation,
  isLanguageCode,
  type Language,
  type Translation,
} from "@/lib/i18n";
import { notifyDispatcher } from "@/lib/notify";

export type NotificationKind =
  | "critical"
  | "booking"
  | "message"
  | "service"
  | "marketing";

export type NotificationImportance = "normal" | "important" | "urgent";

export type CreateNotificationRequest = {
  userUuid: string;
  kind: NotificationKind;
  title: Translation;
  body: Translation;
  importance?: NotificationImportance;
  data?: Record<string, unknown>;
  actionUrl?: string | null;
  externalRequired?: boolean;
  expiresAt?: string | null;
};

export type CreatedNotification = {
  notificationUuid: string;
  createdAt: string;
};

export type NotificationItem = {
  notificationUuid: string;
  kind: NotificationKind;
  importance: NotificationImportance;
  title: string;
  body: string;
  data: Record<string, unknown>;
  actionUrl: string | null;
  externalRequired: boolean;
  readAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};

export type NotificationPreferences = {
  primary: "push" | "line" | "email";
  push: boolean;
  line: boolean;
  email: boolean;
  topics: NotificationTopics;
};

export type NotificationTopic = "email" | "chat" | "group" | "flight" | "company" | "critical";
export type NotificationTopics = Record<NotificationTopic, boolean>;

export type NotificationChannels = {
  line: boolean;
  google: boolean;
  email: boolean;
};

const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  primary: "line",
  push: false,
  line: true,
  email: false,
  topics: { email: true, chat: true, group: false, flight: true, company: true, critical: true },
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const NOTIFICATION_KINDS = new Set<NotificationKind>([
  "critical",
  "booking",
  "message",
  "service",
  "marketing",
]);
const NOTIFICATION_IMPORTANCE = new Set<NotificationImportance>([
  "normal",
  "important",
  "urgent",
]);

export function isNotificationUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

function normalizeTranslation(
  value: Translation,
  field: "title" | "body",
  maximumLength: number,
) {
  const entries = Object.entries(value).map(([language, text]) => {
    const normalizedLanguage = language.toLowerCase();
    const normalizedText = text.trim();

    if (!isLanguageCode(normalizedLanguage)) {
      throw new Error(`Notification ${field} has an invalid language code.`);
    }

    if (!normalizedText || normalizedText.length > maximumLength) {
      throw new Error(`Notification ${field} has an invalid length.`);
    }

    return [normalizedLanguage, normalizedText] as const;
  });

  if (entries.length === 0) {
    throw new Error(`Notification ${field} is required.`);
  }

  return Object.fromEntries(entries);
}

function normalizeActionUrl(value?: string | null) {
  if (!value) {
    return null;
  }

  const actionUrl = value.trim();

  if (
    actionUrl.length > 2_000 ||
    ((!actionUrl.startsWith("/") || actionUrl.startsWith("//")) &&
      !actionUrl.startsWith("https://"))
  ) {
    throw new Error("Notification action URL is invalid.");
  }

  return actionUrl;
}

export async function createNotification({
  userUuid,
  kind,
  title,
  body,
  importance = "normal",
  data = {},
  actionUrl,
  externalRequired = false,
  expiresAt,
}: CreateNotificationRequest): Promise<CreatedNotification> {
  if (!isNotificationUuid(userUuid)) {
    throw new Error("Notification user UUID is invalid.");
  }

  if (!NOTIFICATION_KINDS.has(kind)) {
    throw new Error("Notification kind is invalid.");
  }

  if (!NOTIFICATION_IMPORTANCE.has(importance)) {
    throw new Error("Notification importance is invalid.");
  }

  if (!data || Array.isArray(data)) {
    throw new Error("Notification data must be an object.");
  }

  const normalizedTitle = normalizeTranslation(title, "title", 160);
  const normalizedBody = normalizeTranslation(body, "body", 2_000);
  const normalizedActionUrl = normalizeActionUrl(actionUrl);
  const normalizedExpiresAt = expiresAt ? new Date(expiresAt) : null;

  if (normalizedExpiresAt && Number.isNaN(normalizedExpiresAt.getTime())) {
    throw new Error("Notification expiration date is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_uuid: userUuid,
      kind,
      importance,
      title: normalizedTitle,
      body: normalizedBody,
      data,
      action_url: normalizedActionUrl,
      external_required: externalRequired,
      expires_at: normalizedExpiresAt?.toISOString() ?? null,
    })
    .select("notification_uuid, created_at")
    .single();

  if (error || !notification) {
    await notifyDispatcher({
      level: "error",
      event: "customer_notification_create_failed",
      data: {
        code: error?.code ?? "unknown",
        kind,
        importance,
      },
    });

    throw new Error("Failed to create customer notification.");
  }

  try {
    await sendPushNotification({
      userUuid,
      kind,
      title: normalizedTitle,
      body: normalizedBody,
      data,
      actionUrl: normalizedActionUrl,
    });
  } catch {
    await notifyDispatcher({
      level: "error",
      event: "customer_push_send_failed",
      data: { userUuid, notificationUuid: notification.notification_uuid },
    });
  }

  return {
    notificationUuid: notification.notification_uuid,
    createdAt: notification.created_at,
  };
}

export async function getNotifications({
  userUuid,
  language,
  limit = 20,
}: {
  userUuid: string;
  language: Language;
  limit?: number;
}): Promise<NotificationItem[]> {
  if (!isNotificationUuid(userUuid)) {
    throw new Error("Notification user UUID is invalid.");
  }

  if (!isLanguageCode(language)) {
    throw new Error("Notification language is invalid.");
  }

  const normalizedLimit = Number.isFinite(limit)
    ? Math.min(Math.max(Math.trunc(limit), 1), 100)
    : 20;
  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { data: notifications, error } = await supabase
    .from("notifications")
    .select(
      "notification_uuid, kind, importance, title, body, data, action_url, external_required, read_at, expires_at, created_at",
    )
    .eq("user_uuid", userUuid)
    .neq("kind", "message")
    .or(`expires_at.is.null,expires_at.gt.${now}`)
    .order("created_at", { ascending: false })
    .limit(normalizedLimit);

  if (error) {
    throw new Error("Failed to load customer notifications.");
  }

  return (notifications ?? []).map((notification) => ({
    notificationUuid: notification.notification_uuid,
    kind: notification.kind as NotificationKind,
    importance: notification.importance as NotificationImportance,
    title: getTranslation(notification.title as Translation, language),
    body: getTranslation(notification.body as Translation, language),
    data: notification.data as Record<string, unknown>,
    actionUrl: notification.action_url,
    externalRequired: notification.external_required,
    readAt: notification.read_at,
    expiresAt: notification.expires_at,
    createdAt: notification.created_at,
  }));
}

export async function getUnreadNotificationCount(
  userUuid: string,
): Promise<number> {
  if (!isNotificationUuid(userUuid)) {
    throw new Error("Notification user UUID is invalid.");
  }

  const now = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  const { count, error } = await supabase
    .from("notifications")
    .select("notification_uuid", { count: "exact", head: true })
    .eq("user_uuid", userUuid)
    .neq("kind", "message")
    .is("read_at", null)
    .or(`expires_at.is.null,expires_at.gt.${now}`);

  if (error) {
    throw new Error("Failed to count unread customer notifications.");
  }

  return count ?? 0;
}

export async function getNotificationPreferences(
  userUuid: string,
): Promise<NotificationPreferences> {
  if (!isNotificationUuid(userUuid)) {
    throw new Error("Notification user UUID is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error } = await supabase
    .from("users")
    .select("notification")
    .eq("user_uuid", userUuid)
    .single();

  if (error) {
    throw new Error("Failed to load notification preferences.");
  }

  const notification = user?.notification;
  const preferences =
    notification && typeof notification === "object" && !Array.isArray(notification)
      ? notification as Record<string, unknown>
      : {};

  const primary = preferences.primary === "push" || preferences.primary === "line" || preferences.primary === "email"
    ? preferences.primary
    : preferences.push === true
      ? "push"
      : preferences.line === true
        ? "line"
        : preferences.email === true
          ? "email"
          : DEFAULT_NOTIFICATION_PREFERENCES.primary;

  const storedTopics = preferences.topics && typeof preferences.topics === "object" && !Array.isArray(preferences.topics)
    ? preferences.topics as Record<string, unknown>
    : {};
  const topics = Object.fromEntries(Object.entries(DEFAULT_NOTIFICATION_PREFERENCES.topics).map(([topic, fallback]) => [
    topic,
    typeof storedTopics[topic] === "boolean" ? storedTopics[topic] : fallback,
  ])) as NotificationTopics;

  return { primary, push: primary === "push", line: primary === "line", email: primary === "email", topics };
}

export async function getNotificationChannels(
  userUuid: string,
): Promise<NotificationChannels> {
  if (!isNotificationUuid(userUuid)) {
    throw new Error("Notification user UUID is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { data: accounts, error } = await supabase
    .from("accounts")
    .select("login_type")
    .eq("user_uuid", userUuid);

  if (error) {
    throw new Error("Failed to load notification channels.");
  }

  const types = new Set((accounts ?? []).map((account) => account.login_type));
  return {
    line: types.has("line"),
    google: types.has("google"),
    email: types.has("email"),
  };
}

export async function updateNotificationPreferences({
  userUuid,
  primary,
}: {
  userUuid: string;
  primary: NotificationPreferences["primary"];
}): Promise<NotificationPreferences> {
  if (!isNotificationUuid(userUuid)) {
    throw new Error("Notification user UUID is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { data: user, error: loadError } = await supabase
    .from("users")
    .select("notification")
    .eq("user_uuid", userUuid)
    .single();

  if (loadError) {
    throw new Error("Failed to load notification preferences.");
  }

  const current =
    user?.notification && typeof user.notification === "object" && !Array.isArray(user.notification)
      ? user.notification as Record<string, unknown>
      : {};
  const preferences: NotificationPreferences = {
    primary,
    push: primary === "push",
    line: primary === "line",
    email: primary === "email",
    topics: await getNotificationPreferences(userUuid).then((value) => value.topics),
  };
  const next = { ...current, ...preferences };
  const { error } = await supabase
    .from("users")
    .update({ notification: next })
    .eq("user_uuid", userUuid);

  if (error) {
    throw new Error("Failed to update notification preferences.");
  }

  return preferences;
}

export async function updateNotificationTopics({ userUuid, topics }: { userUuid: string; topics: NotificationTopics }) {
  if (!isNotificationUuid(userUuid)) throw new Error("Notification user UUID is invalid.");
  const supabase = getSupabaseAdmin();
  const { data: user, error: loadError } = await supabase.from("users").select("notification").eq("user_uuid", userUuid).single();
  if (loadError) throw new Error("Failed to load notification preferences.");
  const current = user?.notification && typeof user.notification === "object" && !Array.isArray(user.notification)
    ? user.notification as Record<string, unknown>
    : {};
  const { error } = await supabase.from("users").update({ notification: { ...current, topics } }).eq("user_uuid", userUuid);
  if (error) throw new Error("Failed to update notification topics.");
  return topics;
}

export async function savePushSubscription({
  userUuid,
  subscription,
  userAgent,
}: {
  userUuid: string;
  subscription: { endpoint: string; keys: { p256dh: string; auth: string } };
  userAgent?: string | null;
}) {
  if (!isNotificationUuid(userUuid) || !subscription.endpoint || !subscription.keys?.p256dh || !subscription.keys?.auth) {
    throw new Error("Push subscription is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("push_subscriptions").upsert({
    user_uuid: userUuid,
    endpoint: subscription.endpoint,
    p256dh: subscription.keys.p256dh,
    auth: subscription.keys.auth,
    user_agent: userAgent?.slice(0, 500) || null,
    updated_at: new Date().toISOString(),
  }, { onConflict: "endpoint" });

  if (error) throw new Error("Failed to save push subscription.");
}

export async function deletePushSubscriptions(userUuid: string) {
  if (!isNotificationUuid(userUuid)) {
    throw new Error("Notification user UUID is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("user_uuid", userUuid);
  if (error) throw new Error("Failed to delete push subscriptions.");
}

async function sendPushNotification({
  userUuid,
  kind,
  title,
  body,
  data,
  actionUrl,
}: {
  userUuid: string;
  kind: NotificationKind;
  title: Translation;
  body: Translation;
  data: Record<string, unknown>;
  actionUrl: string | null;
}) {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  const privateKey = process.env.WEB_PUSH_PRIVATE_KEY;
  const subject = process.env.WEB_PUSH_SUBJECT;
  if (!publicKey || !privateKey || !subject) return;

  const preferences = await getNotificationPreferences(userUuid);
  if (preferences.primary !== "push") return;

  const channel = data.channel;
  const mailboxAddress = typeof data.mailboxAddress === "string" ? data.mailboxAddress.toLowerCase() : "";
  const topic: NotificationTopic = kind === "critical"
    ? "critical"
    : channel === "group"
      ? "group"
      : channel === "chat"
        ? "chat"
        : mailboxAddress === "info@paws-flight.com"
          ? "flight"
          : mailboxAddress === "mail@wan.da-nya.com"
            ? "company"
            : "email";
  if (!preferences.topics[topic] || (topic !== "email" && channel === "email" && !preferences.topics.email)) return;
  const emoji: Record<NotificationTopic, string> = { email: "📩", chat: "💬", group: "👥", flight: "✈️", company: "🐾", critical: "⚠️" };

  const supabase = getSupabaseAdmin();
  const [{ data: user }, { data: subscriptions, error }] = await Promise.all([
    supabase.from("users").select("language").eq("user_uuid", userUuid).single(),
    supabase.from("push_subscriptions").select("endpoint, p256dh, auth").eq("user_uuid", userUuid),
  ]);
  if (error || !subscriptions?.length) return;

  const language = isLanguageCode(user?.language) ? user.language : "ja";
  webPush.setVapidDetails(subject, publicKey, privateKey);
  const payload = JSON.stringify({
    title: `${emoji[topic]} ${getTranslation(title, language)}`,
    body: getTranslation(body, language),
    url: actionUrl || "/",
  });

  await Promise.allSettled(subscriptions.map(async (subscription) => {
    try {
      await webPush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }, payload);
    } catch (error) {
      const statusCode = (error as { statusCode?: number }).statusCode;
      if (statusCode === 404 || statusCode === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
      }
    }
  }));
}

export async function markNotificationRead({
  userUuid,
  notificationUuid,
}: {
  userUuid: string;
  notificationUuid: string;
}): Promise<void> {
  if (!isNotificationUuid(userUuid) || !isNotificationUuid(notificationUuid)) {
    throw new Error("Notification UUID is invalid.");
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("notification_uuid", notificationUuid)
    .eq("user_uuid", userUuid)
    .is("read_at", null);

  if (error) {
    throw new Error("Failed to mark customer notification as read.");
  }
}
