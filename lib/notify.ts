import "server-only";

type SecurityNotification = {
  event: "suspicious_request_blocked";
  hostname?: string;
  pathname: string;
  reason: string;
};

function sanitizeText(value: string) {
  return value.replaceAll("`", "ˋ").slice(0, 500);
}

export async function notifySecurityDispatcher({
  event,
  hostname,
  pathname,
  reason,
}: SecurityNotification): Promise<void> {
  const webhookUrl = process.env.DISCORD_NOTIFY_WEBHOOK_URL;
  const mentionUserId = process.env.DISCORD_MENTION_USER_ID;

  if (!webhookUrl || !mentionUserId) {
    console.error("[SECURITY] Discord notify configuration is missing.");
    return;
  }

  const payload = {
    event,
    action: "blocked",
    hostname: hostname ?? "unknown",
    pathname: sanitizeText(pathname),
    reason,
    timestamp: new Date().toISOString(),
  };

  const content = [
    `<@${mentionUserId}>`,
    "[NOTIFY WOLF] AMP_V3 / WARNING",
    `event: ${event}`,
    "```json",
    JSON.stringify(payload, null, 2).slice(0, 1_700),
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
      console.error("[SECURITY] Discord notify webhook failed.", {
        status: response.status,
      });
    }
  } catch (error) {
    console.error("[SECURITY] Discord notify request failed.", error);
  }
}
