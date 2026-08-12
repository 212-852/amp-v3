import { createHmac, timingSafeEqual } from "node:crypto";

import { notifyDispatcher } from "@/lib/notify";

function isValidSignature(body: string, signature: string, secret: string) {
  const expected = createHmac("sha256", secret).update(body).digest();

  let received: Buffer;

  try {
    received = Buffer.from(signature, "base64");
  } catch {
    return false;
  }

  return (
    expected.length === received.length && timingSafeEqual(expected, received)
  );
}

export async function POST(request: Request) {
  const channelSecret = process.env.LINE_MESSAGING_CHANNEL_SECRET;

  if (!channelSecret) {
    console.error("[LINE] Messaging API channel secret is missing.");
    return Response.json(
      { error: "LINE webhook configuration is missing." },
      { status: 503 },
    );
  }

  const signature = request.headers.get("x-line-signature");
  const rawBody = await request.text();

  if (!signature || !isValidSignature(rawBody, signature, channelSecret)) {
    await notifyDispatcher({
      level: "warning",
      event: "line_webhook_signature_rejected",
      data: {
        action: "blocked",
        reason: "invalid_signature",
      },
    });

    return Response.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    JSON.parse(rawBody);
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  return Response.json({ ok: true });
}
