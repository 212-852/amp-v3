import { ArrowDownUp, Search, X } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

import { resolveSessionCached, SESSION_COOKIE_NAME } from "@/lib/identity";

const copy = {
  ja: {
    title: "受信トレイ",
    search: "名前・件名・メッセージを検索",
    sort: "並び替え",
  },
  en: {
    title: "Inbox",
    search: "Search names, subjects, or messages",
    sort: "Sort",
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
  const session = sessionToken ? await resolveSessionCached(sessionToken) : null;
  const text = copy[session?.language === "en" ? "en" : "ja"];

  return (
    <section className="adminInboxPage">
      <header className="adminInboxHeading">
        <h1>{text.title}</h1>
        <div className="adminListTools">
          <details className="adminListSearch"><summary aria-label={text.search} title={text.search}><Search aria-hidden="true" /></summary><form method="get"><label><Search aria-hidden="true" /><span className="srOnly">{text.search}</span><input name="q" type="search" defaultValue={query} placeholder={text.search} /></label><button type="submit">{session?.language === "en" ? "Search" : "検索"}</button></form></details>
          <Link className="adminListSort" href={`?${query ? `q=${encodeURIComponent(query)}&` : ""}sort=${sort === "newest" ? "oldest" : "newest"}`} aria-label={text.sort} title={text.sort}><ArrowDownUp aria-hidden="true" /></Link>
        </div>
        {query ? <div className="adminActiveSearch"><Search aria-hidden="true" /><span>{session?.language === "en" ? "Searching" : "検索中"}</span><strong>{query}</strong><Link href={`?sort=${sort}`} aria-label={session?.language === "en" ? "Clear search" : "検索を解除"} title={session?.language === "en" ? "Clear search" : "検索を解除"}><X aria-hidden="true" /></Link></div> : null}
      </header>
    </section>
  );
}
