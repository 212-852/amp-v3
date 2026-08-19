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
      <Link className="adminMailBack" href="../inbox"><ArrowLeft aria-hidden="true" />{language === "en" ? "Inbox" : "受信トレイ"}</Link>
      <header className="adminMailHeading"><span><Mail aria-hidden="true" /></span><div><h1>{thread.subject}</h1><p>{thread.senderName} &lt;{thread.senderAddress}&gt;</p><small>{language === "en" ? "To" : "宛先"}：{thread.mailboxAddress}</small></div></header>
      <section className="adminMailMessages">
        {thread.messages.map((message) => <div className="adminMailMessage" key={message.messageUuid}><time dateTime={message.createdAt}>{new Intl.DateTimeFormat(language === "en" ? "en" : "ja-JP", { dateStyle: "medium", timeStyle: "short" }).format(new Date(message.createdAt))}</time><div>{message.bodyText}</div></div>)}
      </section>
    </article>
  );
}
