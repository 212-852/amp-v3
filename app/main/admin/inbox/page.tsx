import { ArrowDownUp, MessageCircle, Search } from "lucide-react";
import { cookies } from "next/headers";

import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

const copy = {
  ja: {
    title: "受信トレイ",
    search: "名前・件名・メッセージを検索",
    emptyTitle: "メッセージはまだありません",
    emptyBody: "受信した会話やメールが、ここに時系列で表示されます。",
    sort: "並び替え",
  },
  en: {
    title: "Inbox",
    search: "Search names, subjects, or messages",
    emptyTitle: "No messages yet",
    emptyBody: "Incoming conversations and email will appear here in chronological order.",
    sort: "Sort",
  },
} as const;

export const metadata = {
  title: "受信トレイ | Admin",
};

export default async function InboxPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken
    ? await identityDispatcher({ action: "resolve_session", sessionToken })
    : null;
  const text = copy[session?.language === "en" ? "en" : "ja"];

  return (
    <section className="adminInboxPage">
      <header className="adminInboxHeading">
        <h1>{text.title}</h1>
        <div className="adminListTools">
          <details className="adminListSearch"><summary aria-label={text.search} title={text.search}><Search aria-hidden="true" /></summary><label><Search aria-hidden="true" /><span className="srOnly">{text.search}</span><input type="search" placeholder={text.search} /></label></details>
          <button type="button" aria-label={text.sort} title={text.sort}><ArrowDownUp aria-hidden="true" /></button>
        </div>
      </header>

      <div className="adminInboxWorkspace">
        <section className="adminInboxList">
          <MessageCircle aria-hidden="true" />
          <strong>{text.emptyTitle}</strong>
          <p>{text.emptyBody}</p>
        </section>
      </div>
    </section>
  );
}
