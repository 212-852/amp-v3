import { ArrowDownUp, Mail, Plus, Search, X } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";
import { listInbox, listSendMailboxes } from "@/lib/inbox";

const copy = {
  ja: {
    title: "メッセージボックス",
    search: "名前・件名・メッセージを検索",
    sort: "並び替え",
    compose: "新規メール",
    from: "送信元",
    to: "宛先",
    subject: "件名",
    message: "本文",
    send: "送信する",
    sent: "メールを送信しました。",
    sendError: "メールを送信できませんでした。",
  },
  en: {
    title: "Message box",
    search: "Search names, subjects, or messages",
    sort: "Sort",
    compose: "New email",
    from: "From",
    to: "To",
    subject: "Subject",
    message: "Message",
    send: "Send",
    sent: "Email sent.",
    sendError: "Email could not be sent.",
  },
} as const;

export const metadata = {
  title: "メッセージボックス | Admin",
};

export default async function InboxPage({ searchParams }: PageProps<"/main/admin/inbox">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const sent = params.sent === "1";
  const sendError = params.sendError === "1";
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken ? await resolveSessionCached(sessionToken) : null;
  const text = copy[session?.language === "en" ? "en" : "ja"];
  const items = session ? await listInbox(session.userUuid, query, sort) : [];
  const mailboxes = session ? await listSendMailboxes(session.userUuid, session.tier) : [];

  return (
    <section className="adminInboxPage">
      <header className="adminInboxHeading">
        <h1>{text.title}</h1>
        <div className="adminListTools">
          <details className="adminListSearch"><summary aria-label={text.search} title={text.search}><Search aria-hidden="true" /></summary><form method="get"><label><Search aria-hidden="true" /><span className="srOnly">{text.search}</span><input name="q" type="search" defaultValue={query} placeholder={text.search} /></label><button type="submit">{session?.language === "en" ? "Search" : "検索"}</button></form></details>
          <Link className="adminListSort" href={`?${query ? `q=${encodeURIComponent(query)}&` : ""}sort=${sort === "newest" ? "oldest" : "newest"}`} aria-label={text.sort} title={text.sort}><ArrowDownUp aria-hidden="true" /></Link>
        </div>
        {sent || sendError ? <p className={`adminMailResult${sendError ? " isError" : ""}`} role="status">{sendError ? text.sendError : text.sent}</p> : null}
        {query ? <div className="adminActiveSearch"><Search aria-hidden="true" /><span>{session?.language === "en" ? "Searching" : "検索中"}</span><strong>{query}</strong><Link href={`?sort=${sort}`} aria-label={session?.language === "en" ? "Clear search" : "検索を解除"} title={session?.language === "en" ? "Clear search" : "検索を解除"}><X aria-hidden="true" /></Link></div> : null}
      </header>
      <div className="adminInboxList">
        {items.map((item) => (
          <Link className={`adminInboxItem${item.readAt ? "" : " isUnread"}`} href={`inbox/${item.threadUuid}`} key={item.threadUuid}>
            <span className="adminInboxType"><Mail aria-hidden="true" /></span>
            <span className="adminInboxSummary"><span><strong>{item.senderName}</strong><time dateTime={item.lastMessageAt}>{new Intl.DateTimeFormat(session?.language === "en" ? "en" : "ja-JP", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(item.lastMessageAt))}</time></span><b>{item.subject}</b><small>{item.preview}</small></span>
          </Link>
        ))}
        {items.length === 0 ? <p className="adminInboxEmpty">{session?.language === "en" ? "No messages." : "受信したメールはありません。"}</p> : null}
      </div>
      <details className="adminMailCompose adminMailComposeFloating">
        <summary aria-label={text.compose} title={text.compose}><Plus aria-hidden="true" /></summary>
        <form action="/api/inbox/send" method="post">
          <h2>{text.compose}</h2>
          <label><span>{text.from}</span><select name="from" defaultValue={mailboxes[0] ?? ""} required>{mailboxes.length === 0 ? <option value="">{session?.language === "en" ? "No sender available" : "送信元がありません"}</option> : null}{mailboxes.map((address) => <option value={address} key={address}>{address}</option>)}</select></label>
          <label><span>{text.to}</span><input name="to" type="email" autoComplete="email" required /></label>
          <label><span>{text.subject}</span><input name="subject" maxLength={240} required /></label>
          <label><span>{text.message}</span><textarea name="message" rows={8} maxLength={50000} required /></label>
          <button type="submit">{text.send}</button>
        </form>
      </details>
    </section>
  );
}
