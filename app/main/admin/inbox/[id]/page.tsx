import { ArrowLeft, FileText, Mail, Paperclip, PawPrint, Plane, UserRound } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getInboxThread, listInboxOrders } from "@/lib/inbox";
import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { MessageBody, MessageOrder } from "@/components/message";
import { MessageShare } from "@/components/share";

function safeEmailDocument(html: string) {
  const policy = "default-src 'none'; img-src data:; style-src 'unsafe-inline'; font-src data:; form-action 'none'; base-uri 'none'";
  return `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${policy}"><style>html{color:#222;background:#fff;font:15px/1.65 sans-serif}body{margin:0;padding:16px;overflow-wrap:anywhere}img{max-width:100%;height:auto}table{max-width:100%}a{color:#174f76;text-decoration:underline}</style></head><body>${html}</body></html>`;
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
      <Link className="adminMailBack" href="../inbox"><ArrowLeft aria-hidden="true" />{language === "en" ? "Message box" : "メッセージボックス"}</Link>
      <aside className={`adminMailService is${service.kind}`}><span><Mail aria-hidden="true" /><service.Icon aria-hidden="true" /></span><div><strong>{service.name}</strong><p>{thread.mailboxAddress}</p></div></aside>
      <header className="adminMailHeading"><div><h1>{thread.subject}</h1><p>{thread.senderName}</p><small>{thread.senderAddress}</small></div></header>
      <section className="adminMailMessages">
        {thread.messages.map((message) => <div className={`adminMailMessage is${message.direction === "outbound" ? "Outbound" : "Inbound"}`} key={message.messageUuid}>
          <header><span>{language === "en" ? message.direction === "outbound" ? "Sent" : "Received" : message.direction === "outbound" ? "送信" : "受信"}</span><time dateTime={message.createdAt}>{new Intl.DateTimeFormat(language === "en" ? "en" : "ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.createdAt))}</time></header>
          <MessageBody threadUuid={thread.threadUuid} messageUuid={message.messageUuid} originalText={message.bodyText} language={language} />
          {message.bodyHtml ? <details className="adminMailHtml"><summary><FileText aria-hidden="true" />{language === "en" ? "View HTML email" : "HTMLメールを表示"}</summary><iframe sandbox="" referrerPolicy="no-referrer" srcDoc={safeEmailDocument(message.bodyHtml)} title={language === "en" ? "HTML email content" : "HTMLメール本文"} /></details> : null}
          {message.attachments.length > 0 ? <section className="adminMailAttachments"><h2><Paperclip aria-hidden="true" />{language === "en" ? "Attachments" : "添付書類"}</h2>{message.attachments.map((attachment) => <a href={`/api/inbox/attachments/${attachment.attachmentUuid}`} key={attachment.attachmentUuid}><FileText aria-hidden="true" /><span><strong>{attachment.filename}</strong><small>{attachment.contentType} · {formatBytes(attachment.sizeBytes, language)}</small></span></a>)}</section> : null}
          <footer><MessageOrder threadUuid={thread.threadUuid} messageUuid={message.messageUuid} attachmentCount={message.attachments.length} language={language} /><MessageShare messageUuid={message.messageUuid} attachmentCount={message.attachments.length} language={language} orders={orders} /></footer>
        </div>)}
      </section>
    </article>
  );
}
