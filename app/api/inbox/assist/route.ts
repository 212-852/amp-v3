import type { NextRequest } from "next/server";

import { suggestOrder, translateMessage } from "@/lib/ai";
import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { getInboxThread } from "@/lib/inbox";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return Response.json({ error: "Forbidden." }, { status: 403 });
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  if (!session) return Response.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  const threadUuid = typeof body?.threadUuid === "string" ? body.threadUuid : "";
  const messageUuid = typeof body?.messageUuid === "string" ? body.messageUuid : "";
  const action = body?.action;
  if (!threadUuid || !messageUuid || (action !== "translate" && action !== "suggest_order")) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  const thread = await getInboxThread(session.userUuid, threadUuid);
  const message = thread?.messages.find((item) => item.messageUuid === messageUuid);
  if (!thread || !message) return Response.json({ error: "Message could not be found." }, { status: 404 });

  try {
    if (action === "translate") {
      const targetLanguage = body?.targetLanguage === "en" ? "en" : "ja";
      return Response.json({ translatedText: await translateMessage(message.bodyText, targetLanguage) });
    }
    if (session.role !== "admin") return Response.json({ error: "Forbidden." }, { status: 403 });
    const suggestion = await suggestOrder({
      subject: message.subject,
      body: message.bodyText,
      senderName: thread.senderName,
      senderAddress: thread.senderAddress,
      mailboxAddress: thread.mailboxAddress,
      receivedAt: message.createdAt,
      language: session.language === "en" ? "en" : "ja",
    });
    return Response.json({ suggestion });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "AI processing failed." }, { status: 502 });
  }
}
