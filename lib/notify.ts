import "server-only";

type NotifyLevel = "info" | "warning" | "error";

type NotifyRequest = {
  level: NotifyLevel;
  event: string;
  data: Record<string, unknown>;
};

function sanitizePayload(data: Record<string, unknown>) {
  return JSON.stringify(data, null, 2)
    .replaceAll("`", "ˋ")
    .slice(0, 1_700);
}

export async function notifyDispatcher({
  level,
  event,
  data,
}: NotifyRequest): Promise<void> {
  const webhookUrl = process.env.DISCORD_NOTIFY_WEBHOOK_URL;
  const mentionUserId = process.env.DISCORD_MENTION_USER_ID;

  if (!webhookUrl || !mentionUserId) {
    console.error("[NOTIFY] Discord notify configuration is missing.");
    return;
  }

  const payload = {
    event,
    data,
    timestamp: new Date().toISOString(),
  };

  const content = [
    `<@${mentionUserId}>`,
    `[NOTIFY WOLF] AMP_V3 / ${level.toUpperCase()}`,
    `event: ${event}`,
    "```json",
    sanitizePayload(payload),
    "```",
  ].join("\n");

  try {
    const response = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: "Notify Wolf",
        content,
        allowed_mentions: {
          users: [mentionUserId],
        },
      }),
    });

    if (!response.ok) {
      console.error("[NOTIFY] Discord notify webhook failed.", {
        status: response.status,
      });
    }
  } catch (error) {
    console.error("[NOTIFY] Discord notify request failed.", error);
  }
}
