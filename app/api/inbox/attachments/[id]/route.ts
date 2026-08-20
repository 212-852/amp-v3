import type { NextRequest } from "next/server";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { downloadInboxAttachment } from "@/lib/inbox";

export async function GET(request: NextRequest, context: RouteContext<"/api/inbox/attachments/[id]">) {
  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  if (!session || session.role !== "admin") return new Response("Unauthorized", { status: 401 });
  const { id } = await context.params;
  const attachment = await downloadInboxAttachment(session.userUuid, id);
  if (!attachment) return new Response("Not found", { status: 404 });
  const filename = attachment.filename.replace(/[\r\n"\\]/g, "_");
  return new Response(attachment.data, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Type": attachment.contentType,
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
      "X-Content-Type-Options": "nosniff",
    },
  });
}
