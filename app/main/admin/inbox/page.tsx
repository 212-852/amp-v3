import { Mail, MessageCircle, Search, Users } from "lucide-react";

const copy = {
  ja: {
    title: "受信トレイ",
    description: "顧客とのチャット、グループの会話、メールをまとめて確認します。",
    search: "名前・件名・メッセージを検索",
    all: "すべて",
    direct: "個別チャット",
    group: "グループ",
    email: "メール",
    emptyTitle: "メッセージはまだありません",
    emptyBody: "受信した会話やメールが、ここに時系列で表示されます。",
    detailTitle: "会話を選択してください",
    detailBody: "左側の一覧から会話を選ぶと、内容を確認できます。",
  },
  en: {
    title: "Inbox",
    description: "Review customer chats, group conversations, and email in one place.",
    search: "Search names, subjects, or messages",
    all: "All",
    direct: "Direct chats",
    group: "Groups",
    email: "Email",
    emptyTitle: "No messages yet",
    emptyBody: "Incoming conversations and email will appear here in chronological order.",
    detailTitle: "Select a conversation",
    detailBody: "Choose a conversation from the list to review its contents.",
  },
} as const;

export const metadata = {
  title: "受信トレイ | Admin",
};

export default function InboxPage() {
  const text = copy.ja;

  return (
    <section className="adminInboxPage">
      <header className="adminInboxHeading">
        <div>
          <h1>{text.title}</h1>
          <p>{text.description}</p>
        </div>
      </header>

      <div className="adminInboxFilters" aria-label="受信トレイの種類">
        <button className="isActive" type="button"><MessageCircle aria-hidden="true" />{text.all}</button>
        <button type="button"><MessageCircle aria-hidden="true" />{text.direct}</button>
        <button type="button"><Users aria-hidden="true" />{text.group}</button>
        <button type="button"><Mail aria-hidden="true" />{text.email}</button>
      </div>

      <label className="adminInboxSearch">
        <Search aria-hidden="true" />
        <span className="srOnly">{text.search}</span>
        <input type="search" placeholder={text.search} />
      </label>

      <div className="adminInboxWorkspace">
        <section className="adminInboxList">
          <MessageCircle aria-hidden="true" />
          <strong>{text.emptyTitle}</strong>
          <p>{text.emptyBody}</p>
        </section>
        <section className="adminInboxDetail">
          <Mail aria-hidden="true" />
          <strong>{text.detailTitle}</strong>
          <p>{text.detailBody}</p>
        </section>
      </div>
    </section>
  );
}
