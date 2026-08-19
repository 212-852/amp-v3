import { cookies } from "next/headers";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { sendInboxEmail } from "@/lib/inbox";
import { notifyDispatcher } from "@/lib/notify";

export async function POST(request: Request) {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  const requestUrl = new URL(request.url);
  const local = ["localhost", "127.0.0.1"].includes(requestUrl.hostname);
  const returnUrl = new URL(local ? "/main/admin/inbox" : "/admin/inbox", requestUrl);

  if (!session || session.role !== "admin") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await request.formData();
  try {
    const result = await sendInboxEmail({
      senderUserUuid: session.userUuid,
      senderTier: session.tier,
      mailboxAddress: String(form.get("from") ?? ""),
      recipientAddress: String(form.get("to") ?? ""),
      subject: String(form.get("subject") ?? ""),
      message: String(form.get("message") ?? ""),
    });
    returnUrl.searchParams.set("sent", "1");
    returnUrl.searchParams.set("thread", result.threadUuid);
  } catch (error) {
    await notifyDispatcher({
      level: "error",
      event: "inbox_email_send_request_failed",
      data: { reason: error instanceof Error ? error.message : "unknown" },
    });
    returnUrl.searchParams.set("sendError", "1");
  }
  return Response.redirect(returnUrl, 303);
}
