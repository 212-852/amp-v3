import { Cat, Dog, Plus, Search } from "lucide-react";
import { cookies } from "next/headers";

import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

const copy = {
  ja: {
    title: "ペット一覧",
    description: "犬種・猫種などのペット情報を、ここでまとめて管理します。",
    search: "名前・犬種・猫種を検索",
    add: "ペット情報を追加",
    dog: "犬種",
    cat: "猫種",
    empty: "登録されたペット情報はまだありません。",
  },
  en: {
    title: "Pets",
    description: "Manage dog breeds, cat breeds, and other pet information here.",
    search: "Search names or breeds",
    add: "Add pet information",
    dog: "Dog breeds",
    cat: "Cat breeds",
    empty: "No pet information has been added yet.",
  },
} as const;

export const metadata = { title: "ペット一覧 | Admin" };

export default async function PetsPage() {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken
    ? await identityDispatcher({ action: "resolve_session", sessionToken })
    : null;
  const text = copy[session?.language === "en" ? "en" : "ja"];

  return (
    <section className="adminContentPage">
      <header className="adminContentHeading">
        <div><h1>{text.title}</h1><p>{text.description}</p></div>
        <button type="button"><Plus aria-hidden="true" />{text.add}</button>
      </header>
      <label className="adminContentSearch">
        <Search aria-hidden="true" />
        <span className="srOnly">{text.search}</span>
        <input type="search" placeholder={text.search} />
      </label>
      <div className="adminContentKinds">
        <button className="isActive" type="button"><Dog aria-hidden="true" />{text.dog}</button>
        <button type="button"><Cat aria-hidden="true" />{text.cat}</button>
      </div>
      <div className="adminContentEmpty"><Dog aria-hidden="true" /><p>{text.empty}</p></div>
    </section>
  );
}
