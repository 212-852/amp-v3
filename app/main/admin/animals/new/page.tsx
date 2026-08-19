import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { identityDispatcher, SESSION_COOKIE_NAME, type AnimalCategory, type AnimalStatus } from "@/lib/identity";

const copy = {
  ja: { title: "動物データを新規登録", description: "検索・お客様の選択肢・公開ページで共通利用する情報を登録します。", back: "動物データベースへ戻る", basic: "基本情報", details: "公開・輸送情報", nameJa: "名称（日本語）", nameEn: "名称（英語）", category: "分類", slug: "URL用の名前", aliases: "別名・検索語", summaryJa: "特徴（日本語）", summaryEn: "特徴（英語）", transportJa: "輸送条件（日本語）", transportEn: "輸送条件（英語）", crateJa: "クレート目安（日本語）", crateEn: "クレート目安（英語）", image: "代表画像URL", status: "公開状態", save: "登録する", hint: "別名はカンマ区切りで入力してください。", categories: { dog: "犬", cat: "猫", rabbit: "うさぎ", bird: "鳥", reptile: "爬虫類", other: "その他" }, statuses: { draft: "下書き", published: "公開中", archived: "非公開" } },
  en: { title: "Add animal record", description: "Add shared information for search, customer choices, and public pages.", back: "Back to animal database", basic: "Basic information", details: "Public & transport information", nameJa: "Japanese name", nameEn: "English name", category: "Category", slug: "URL slug", aliases: "Aliases / keywords", summaryJa: "Japanese profile", summaryEn: "English profile", transportJa: "Japanese transport guidance", transportEn: "English transport guidance", crateJa: "Japanese crate guidance", crateEn: "English crate guidance", image: "Representative image URL", status: "Status", save: "Save record", hint: "Separate aliases with commas.", categories: { dog: "Dogs", cat: "Cats", rabbit: "Rabbits", bird: "Birds", reptile: "Reptiles", other: "Other" }, statuses: { draft: "Draft", published: "Published", archived: "Archived" } },
} as const;
const categories: AnimalCategory[] = ["dog", "cat", "rabbit", "bird", "reptile", "other"];

export default async function NewAnimalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await identityDispatcher({ action: "resolve_session", sessionToken: token }) : null;
  const language = session?.language === "en" ? "en" : "ja";
  const text = copy[language];

  async function create(formData: FormData) {
    "use server";
    const store = await cookies();
    const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;
    const current = sessionToken ? await identityDispatcher({ action: "resolve_session", sessionToken }) : null;
    if (!current || current.role !== "admin") throw new Error("Forbidden");
    const value = (key: string) => String(formData.get(key) ?? "").trim();
    const category = value("category") as AnimalCategory;
    const status = value("status") as AnimalStatus;
    const slug = value("slug").toLowerCase();
    if (!categories.includes(category) || !["draft", "published", "archived"].includes(status) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !value("nameJa")) throw new Error("Invalid animal record");
    const aliases = (key: string) => value(key).split(/[,、]/).map((item) => item.trim()).filter(Boolean).slice(0, 20);
    await identityDispatcher({ action: "create_animal", createdBy: current.userUuid, animal: { category, status, slug, name: { ja: value("nameJa"), en: value("nameEn") }, aliases: { ja: aliases("aliasesJa"), en: aliases("aliasesEn") }, summary: { ja: value("summaryJa"), en: value("summaryEn") }, transport: { ja: value("transportJa"), en: value("transportEn") }, crateNote: { ja: value("crateJa"), en: value("crateEn") }, imageUrl: value("image") || null } });
    redirect("/main/admin/animals");
  }

  return <section className="adminContentPage adminPetPage adminPetNew">
    <Link className="adminPetBack" href="/main/admin/animals"><ArrowLeft aria-hidden="true" />{text.back}</Link>
    <header className="adminContentHeading"><div><h1>{text.title}</h1><p>{text.description}</p></div></header>
    <form action={create} className="adminPetForm">
      <fieldset><legend>{text.basic}</legend><div className="adminPetFields">
        <label>{text.nameJa}<input name="nameJa" required maxLength={80} /></label><label>{text.nameEn}<input name="nameEn" maxLength={80} /></label>
        <label>{text.category}<select name="category" required>{categories.map((item) => <option value={item} key={item}>{text.categories[item]}</option>)}</select></label>
        <label>{text.slug}<input name="slug" required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" placeholder="golden-retriever" /></label>
        <label>{text.aliases}（日本語）<input name="aliasesJa" /><small>{text.hint}</small></label><label>{text.aliases}（English）<input name="aliasesEn" /></label>
      </div></fieldset>
      <fieldset><legend>{text.details}</legend><div className="adminPetFields">
        <label>{text.summaryJa}<textarea name="summaryJa" rows={4} /></label><label>{text.summaryEn}<textarea name="summaryEn" rows={4} /></label>
        <label>{text.transportJa}<textarea name="transportJa" rows={4} /></label><label>{text.transportEn}<textarea name="transportEn" rows={4} /></label>
        <label>{text.crateJa}<textarea name="crateJa" rows={4} /></label><label>{text.crateEn}<textarea name="crateEn" rows={4} /></label>
        <label>{text.image}<input name="image" type="url" /></label><label>{text.status}<select name="status">{(["draft", "published", "archived"] as AnimalStatus[]).map((item) => <option value={item} key={item}>{text.statuses[item]}</option>)}</select></label>
      </div></fieldset>
      <button className="adminPetSave" type="submit"><Save aria-hidden="true" />{text.save}</button>
    </form>
  </section>;
}
