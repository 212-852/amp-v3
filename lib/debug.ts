import "server-only";

type DebugLevel = "info" | "warn" | "error";

type DebugRequest = {
  level?: DebugLevel;
  event: string;
  data?: Record<string, unknown>;
};

const SENSITIVE_KEYS = new Set([
  "authorization",
  "cookie",
  "email",
  "idtoken",
  "password",
  "token",
  "useruuid",
  "visitoruuid",
]);

function sanitizeValue(key: string, value: unknown): unknown {
  if (SENSITIVE_KEYS.has(key.toLowerCase())) {
    return "[REDACTED]";
  }

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue("", item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([childKey, childValue]) => [
        childKey,
        sanitizeValue(childKey, childValue),
      ]),
    );
  }

  return value;
}

function sanitizeData(data?: Record<string, unknown>) {
  if (!data) {
    return undefined;
  }

  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [
      key,
      sanitizeValue(key, value),
    ]),
  );
}

async function sendDiscordDebugMessage(
  level: DebugLevel,
  event: string,
  data?: Record<string, unknown>,
) {
  const webhookUrl = process.env.DISCORD_DEBUG_WEBHOOK_URL;
  const mentionUserId = process.env.DISCORD_DEBUG_MENTION_USER_ID;

  if (!webhookUrl || !mentionUserId) {
    return;
  }

  const debugPayload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const content = [
    `<@${mentionUserId}>`,
    `[DEBUG CAT] AMP_V3 / ${level.toUpperCase()}`,
    `event: ${event}`,
    "```json",
    JSON.stringify(debugPayload, null, 2).slice(0, 1700),
    "```",
  ].join("\n");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Debug Cat",
        content,
        allowed_mentions: {
          users: [mentionUserId],
        },
      }),
    });

    if (!response.ok) {
      console.error("[DEBUG] Discord webhook failed.", {
        status: response.status,
      });
    }
  } catch (error) {
    console.error("[DEBUG] Discord webhook request failed.", error);
  }
}

export async function debugDispatcher({
  level = "info",
  event,
  data,
}: DebugRequest): Promise<void> {
  const sanitizedData = sanitizeData(data);

  if (process.env.NODE_ENV !== "production") {
    const payload = {
      event,
      data: sanitizedData,
      timestamp: new Date().toISOString(),
    };

    switch (level) {
      case "info":
        console.info("[DEBUG]", payload);
        break;

      case "warn":
        console.warn("[DEBUG]", payload);
        break;

      case "error":
        console.error("[DEBUG]", payload);
        break;

      default: {
        const exhaustiveCheck: never = level;
        return exhaustiveCheck;
      }
    }
  }

  await sendDiscordDebugMessage(level, event, sanitizedData);
}