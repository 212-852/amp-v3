import { ArrowLeft, Mail } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getInboxThread } from "@/lib/inbox";
import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";

export default async function InboxThreadPage({ params }: PageProps<"/main/admin/inbox/[id]">) {
  const { id } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await resolveSessionCached(token) : null;
  if (!session) notFound();
  const thread = await getInboxThread(session.userUuid, id);
  if (!thread) notFound();
  const language = session.language === "en" ? "en" : "ja";

  return (
    <article className="adminMailPage">
      <Link className="adminMailBack" href="../inbox"><ArrowLeft aria-hidden="true" />{language === "en" ? "Message box" : "メッセージボックス"}</Link>
      <header className="adminMailHeading"><span><Mail aria-hidden="true" /></span><div><h1>{thread.subject}</h1><p>{thread.senderName} &lt;{thread.senderAddress}&gt;</p><small>{language === "en" ? "Service inbox" : "受付窓口"}：{thread.mailboxAddress.endsWith("@paws-flight.com") ? "PawsFlight" : thread.mailboxAddress.endsWith("@wan.da-nya.com") ? language === "en" ? "Company reception" : "会社総合受付" : language === "en" ? "Personal inbox" : "個人メール"}</small></div></header>
      <section className="adminMailMessages">
        {thread.messages.map((message) => <div className={`adminMailMessage is${message.direction === "outbound" ? "Outbound" : "Inbound"}`} key={message.messageUuid}><header><span>{language === "en" ? message.direction === "outbound" ? "Sent" : "Received" : message.direction === "outbound" ? "送信" : "受信"}</span><time dateTime={message.createdAt}>{new Intl.DateTimeFormat(language === "en" ? "en" : "ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.createdAt))}</time></header><div>{message.bodyText}</div></div>)}
      </section>
    </article>
  );
}
