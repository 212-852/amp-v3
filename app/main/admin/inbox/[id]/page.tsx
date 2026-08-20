import { ArrowLeft, FileText, Mail, Paperclip, PawPrint, Plane, UserRound } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getInboxThread, listInboxOrders } from "@/lib/inbox";
import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { MessageBody, MessageHtml, MessageOrder } from "@/components/message";
import { MessageShare } from "@/components/share";

function safeEmailDocument(html: string) {
  const policy = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'";
  const transparentPixel = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
  const sanitizedHtml = html
    .replace(/<script\b[^>]*>[\s\S]*?(?:<\/script\s*>|$)/gi, "")
    .replace(/<(?:iframe|object|embed)\b[^>]*>[\s\S]*?<\/(?:iframe|object|embed)\s*>/gi, "")
    .replace(/\s+on[a-z][\w:-]*\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s+(?:href|src|formaction)\s*=\s*(?:"\s*(?:javascript|vbscript|data):[^"]*"|'\s*(?:javascript|vbscript|data):[^']*'|(?:javascript|vbscript|data):[^\s>]+)/gi, "")
    .replace(/<meta\b[^>]*http-equiv\s*=\s*(?:"refresh"|'refresh'|refresh)[^>]*>/gi, "")
    .replace(/<link\b[^>]*>/gi, "")
    .replace(/@import\s+(?:url\()?\s*["']?https?:\/\/[^;)}"']+["']?\s*\)?\s*;?/gi, "")
    .replace(/url\(\s*(["']?)https?:\/\/.*?\1\s*\)/gi, "none")
    .replace(/\ssrcset\s*=\s*(["']).*?\1/gi, "")
    .replace(/\ssrc\s*=\s*(["'])\s*https?:\/\/.*?\1/gi, ` src="${transparentPixel}" data-external-image="blocked"`);
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>html{width:100%;color:#222;background:#fff;font:15px/1.65 sans-serif}body{box-sizing:border-box;width:100%!important;min-width:0!important;max-width:100%!important;margin:0;padding:16px;overflow-x:hidden;overflow-wrap:anywhere}table{width:100%!important;min-width:0!important;max-width:100%!important;border-collapse:collapse}tbody,tr,td,th,div,p{min-width:0!important;max-width:100%!important;overflow-wrap:anywhere}img{max-width:100%!important;height:auto!important}img[data-external-image="blocked"]{display:none}pre{max-width:100%;white-space:pre-wrap;overflow-wrap:anywhere}a{color:#174f76;text-decoration:underline}</style></head><body>${sanitizedHtml}</body></html>`;
}

function formatBytes(size: number, language: "ja" | "en") {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 102.4) / 10} KB`;
  return `${Math.round(size / 1024 / 102.4) / 10} MB${language === "ja" ? "" : ""}`;
}

export default async function InboxThreadPage({ params }: PageProps<"/main/admin/inbox/[id]">) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  if (!session) notFound();
  const thread = await getInboxThread(session.userUuid, id);
  if (!thread) notFound();
  const orders = await listInboxOrders();
  const language = session.language === "en" ? "en" : "ja";
  const service = thread.mailboxAddress.endsWith("@paws-flight.com")
    ? { Icon: Plane, kind: "Flight", name: "PawsFlight" }
    : thread.mailboxAddress.endsWith("@wan.da-nya.com")
      ? { Icon: PawPrint, kind: "Company", name: language === "en" ? "Wandanya Inc." : "わんだにゃー株式会社" }
      : { Icon: UserRound, kind: "Personal", name: language === "en" ? "Personal inbox" : "個人メール" };

  return (
    <article className="adminMailPage">
      <Link className="adminMailBack" href="../inbox" aria-label={language === "en" ? "Back to message list" : "メッセージ一覧へ戻る"} title={language === "en" ? "Back to message list" : "メッセージ一覧へ戻る"}><ArrowLeft aria-hidden="true" /></Link>
      <aside className={`adminMailService is${service.kind}`}><span><Mail aria-hidden="true" /><service.Icon aria-hidden="true" /></span><div><strong>{service.name}</strong><p>{thread.mailboxAddress}</p></div></aside>
      <header className="adminMailHeading"><div><h1>{thread.subject}</h1><p>{thread.senderName}</p><small>{thread.senderAddress}</small></div></header>
      <section className="adminMailMessages">
        {thread.messages.map((message) => <div className={`adminMailMessage is${message.direction === "outbound" ? "Outbound" : "Inbound"}`} key={message.messageUuid}>
          <header><span>{language === "en" ? message.direction === "outbound" ? "Sent" : "Received" : message.direction === "outbound" ? "送信" : "受信"}</span><time dateTime={message.createdAt}>{new Intl.DateTimeFormat(language === "en" ? "en" : "ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.createdAt))}</time></header>
          {message.bodyHtml
            ? <div className="adminMailHtml"><MessageHtml document={safeEmailDocument(message.bodyHtml)} language={language} /></div>
            : <MessageBody threadUuid={thread.threadUuid} messageUuid={message.messageUuid} originalText={message.bodyText} language={language} />}
          {message.attachments.length > 0 ? <section className="adminMailAttachments"><h2><Paperclip aria-hidden="true" />{language === "en" ? "Attachments" : "添付書類"}</h2>{message.attachments.map((attachment) => <a href={`/api/inbox/attachments/${attachment.attachmentUuid}`} key={attachment.attachmentUuid}><FileText aria-hidden="true" /><span><strong>{attachment.filename}</strong><small>{attachment.contentType} · {formatBytes(attachment.sizeBytes, language)}</small></span></a>)}</section> : null}
          <footer><MessageOrder threadUuid={thread.threadUuid} messageUuid={message.messageUuid} attachmentCount={message.attachments.length} language={language} /><MessageShare messageUuid={message.messageUuid} attachmentCount={message.attachments.length} language={language} orders={orders} /></footer>
        </div>)}
      </section>
    </article>
  );
}
