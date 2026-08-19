import { ArrowDownUp, Building2, Mail, MessageCircle, Search, UserRound, UsersRound } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

const copy = {
  ja: {
    title: "受信トレイ",
    search: "名前・件名・メッセージを検索",
    emptyTitle: "メッセージはまだありません",
    emptyBody: "受信した会話やメールが、ここに時系列で表示されます。",
    sort: "並び替え",
    overallMail: "総合メール",
    personalMail: "個人メール",
    chat: "個別チャット",
    group: "グループ",
  },
  en: {
    title: "Inbox",
    search: "Search names, subjects, or messages",
    emptyTitle: "No messages yet",
    emptyBody: "Incoming conversations and email will appear here in chronological order.",
    sort: "Sort",
    overallMail: "Shared email",
    personalMail: "Personal email",
    chat: "Direct chat",
    group: "Group",
  },
} as const;

export const metadata = {
  title: "受信トレイ | Admin",
};

export default async function InboxPage({ searchParams }: PageProps<"/main/admin/inbox">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const sort = params.sort === "oldest" ? "oldest" : "newest";
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken
    ? await identityDispatcher({ action: "resolve_session", sessionToken })
    : null;
  const text = copy[session?.language === "en" ? "en" : "ja"];
  const canSeeOverallMail = session?.tier === "owner" || session?.tier === "core";

  return (
    <section className="adminInboxPage">
      <header className="adminInboxHeading">
        <h1>{text.title}</h1>
        <div className="adminListTools">
          <details className="adminListSearch"><summary aria-label={text.search} title={text.search}><Search aria-hidden="true" /></summary><form method="get"><label><Search aria-hidden="true" /><span className="srOnly">{text.search}</span><input name="q" type="search" defaultValue={query} placeholder={text.search} /></label><button type="submit">{session?.language === "en" ? "Search" : "検索"}</button></form></details>
          <Link className="adminListSort" href={`?${query ? `q=${encodeURIComponent(query)}&` : ""}sort=${sort === "newest" ? "oldest" : "newest"}`} aria-label={text.sort} title={text.sort}><ArrowDownUp aria-hidden="true" /></Link>
        </div>
      </header>

      <nav className="adminInboxTypes" aria-label={session?.language === "en" ? "Message types" : "メッセージ種別"}>
        {canSeeOverallMail ? <span title={text.overallMail}><span className="adminInboxTypeIcon adminInboxTypeIcon--shared"><Mail aria-hidden="true" /><Building2 aria-hidden="true" /></span><strong>{text.overallMail}</strong></span> : null}
        <span title={text.personalMail}><span className="adminInboxTypeIcon"><Mail aria-hidden="true" /><UserRound aria-hidden="true" /></span><strong>{text.personalMail}</strong></span>
        <span title={text.chat}><span className="adminInboxTypeIcon"><MessageCircle aria-hidden="true" /></span><strong>{text.chat}</strong></span>
        <span title={text.group}><span className="adminInboxTypeIcon"><UsersRound aria-hidden="true" /></span><strong>{text.group}</strong></span>
      </nav>

      <div className="adminInboxWorkspace">
        <section className="adminInboxList">
          <strong>{text.emptyTitle}</strong>
        </section>
      </div>
    </section>
  );
}
