import type { NextRequest } from "next/server";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { createInboxMessageShare } from "@/lib/inbox";

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) return Response.json({ error: "Forbidden." }, { status: 403 });
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  if (!session || session.role !== "admin") return Response.json({ error: "Unauthorized." }, { status: 401 });
  const body = await request.json().catch(() => null) as Record<string, unknown> | null;
  if (!body || (body.targetType !== "order" && body.targetType !== "workspace")) {
    return Response.json({ error: "Invalid request." }, { status: 400 });
  }
  try {
    await createInboxMessageShare({
      userUuid: session.userUuid,
      messageUuid: String(body.messageUuid ?? ""),
      targetType: body.targetType,
      orderUuid: typeof body.orderUuid === "string" && body.orderUuid ? body.orderUuid : null,
      businessUnit: typeof body.businessUnit === "string" ? body.businessUnit : null,
      workType: typeof body.workType === "string" ? body.workType : null,
      targetReference: String(body.targetReference ?? ""),
      includeBody: body.includeBody !== false,
      includeAttachments: body.includeAttachments !== false,
      sharedDatetime: typeof body.sharedDatetime === "string" && body.sharedDatetime ? body.sharedDatetime : null,
      note: String(body.note ?? ""),
    });
    return Response.json({ shared: true });
  } catch (error) {
    return Response.json({ error: error instanceof Error ? error.message : "Message could not be shared." }, { status: 400 });
  }
}
