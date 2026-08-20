import { Resend } from "resend";

import { receiveInboxEmail } from "@/lib/inbox";
import { notifyDispatcher } from "@/lib/notify";

type ReceivedEvent = {
  type: "email.received";
  data: {
    email_id: string;
    message_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
  };
};

function getResend() {
  const apiKey = process.env.RESEND_RECEIVING_API_KEY
    ?? process.env.AMP_MAIL_RESEND_API_KEY
    ?? process.env.MAIL_RESEND_API_KEY
    ?? process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Resend receiving configuration is missing.");
  return new Resend(apiKey);
}

export async function POST(request: Request) {
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET;
  if (!webhookSecret) {
    await notifyDispatcher({ level: "error", event: "inbox_webhook_configuration_missing", data: {} });
    return Response.json({ error: "Webhook configuration is missing." }, { status: 503 });
  }

  const payload = await request.text();
  const resend = getResend();
  let event: ReceivedEvent;
  try {
    event = resend.webhooks.verify({
      payload,
      headers: {
        id: request.headers.get("svix-id") ?? "",
        timestamp: request.headers.get("svix-timestamp") ?? "",
        signature: request.headers.get("svix-signature") ?? "",
      },
      webhookSecret,
    }) as ReceivedEvent;
  } catch (error) {
    await notifyDispatcher({ level: "warning", event: "inbox_webhook_verification_failed", data: { reason: error instanceof Error ? error.message : "unknown" } });
    return Response.json({ error: "Invalid webhook signature." }, { status: 401 });
  }

  if (event.type !== "email.received") return Response.json({ received: true });

  try {
    const { data: email, error } = await resend.emails.receiving.get(event.data.email_id);
    if (error || !email) throw new Error(error?.message ?? "Received email could not be retrieved.");
    const result = await receiveInboxEmail({
      externalId: email.id,
      messageId: email.message_id,
      sender: email.from,
      recipients: email.to,
      headers: email.headers,
      subject: email.subject,
      text: email.text,
      html: email.html,
      receivedAt: email.created_at,
    });
    if (result.ignored) return Response.json({ received: true, ignored: true });
    return Response.json({ received: true, duplicate: result.duplicate });
  } catch (error) {
    await notifyDispatcher({
      level: "error",
      event: "inbox_email_receive_failed",
      data: { emailId: event.data.email_id, reason: error instanceof Error ? error.message : "unknown" },
    });
    return Response.json({ error: "Email could not be stored." }, { status: 500 });
  }
}
