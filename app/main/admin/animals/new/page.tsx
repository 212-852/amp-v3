import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { identityDispatcher, SESSION_COOKIE_NAME, type AnimalProfile, type AnimalStatus } from "@/lib/identity";
import { AnimalForm } from "@/components/animalform";

function slugify(value: string) {
  return value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);
}

const copy = {
  ja: { title: "動物データを新規登録", back: "動物データベースへ戻る", basic: "基本情報", details: "公開・輸送情報", nameJa: "名称（日本語）", nameEn: "名称（英語）", tags: "タグ", slug: "URL用の名前", aliases: "別名・検索語", summaryJa: "特徴（日本語）", summaryEn: "特徴（英語）", transportJa: "輸送条件（日本語）", transportEn: "輸送条件（英語）", crateJa: "クレート目安（日本語）", crateEn: "クレート目安（英語）", image: "代表画像URL", status: "公開状態", save: "登録する", hint: "カンマ区切りで複数入力できます。例：犬、大型犬、長毛", statuses: { draft: "下書き", published: "公開中", archived: "非公開" } },
  en: { title: "Add animal record", back: "Back to animal database", basic: "Basic information", details: "Public & transport information", nameJa: "Japanese name", nameEn: "English name", tags: "Tags", slug: "URL slug", aliases: "Aliases / keywords", summaryJa: "Japanese profile", summaryEn: "English profile", transportJa: "Japanese transport guidance", transportEn: "English transport guidance", crateJa: "Japanese crate guidance", crateEn: "English crate guidance", image: "Representative image URL", status: "Status", save: "Save record", hint: "Separate multiple tags with commas.", statuses: { draft: "Draft", published: "Published", archived: "Archived" } },
} as const;

export default async function NewAnimalPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await identityDispatcher({ action: "resolve_session", sessionToken: token }) : null;
  const language = session?.language === "en" ? "en" : "ja";
  const text = copy[language];
  const animals = await identityDispatcher({ action: "list_animals", query: "" });
  const existingTags = Array.from(new Set(animals.flatMap((animal) => animal.tags).map((tag) => tag.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, language));

  async function create(formData: FormData) {
    "use server";
    const store = await cookies();
    const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;
    const current = sessionToken ? await identityDispatcher({ action: "resolve_session", sessionToken }) : null;
    if (!current || current.role !== "admin") throw new Error("Forbidden");
    const value = (key: string) => String(formData.get(key) ?? "").trim();
    const status = value("status") as AnimalStatus;
    const slug = slugify(value("nameEn"));
    if (!["draft", "published", "archived"].includes(status) || !slug || !value("nameJa") || !value("nameEn")) throw new Error("Invalid animal record");
    const aliases = (key: string) => Array.from(new Map(value(key).split(/[,、]/).map((item) => item.trim()).filter(Boolean).map((item) => [item.toLocaleLowerCase(), item])).values()).slice(0, 20);
    const escapeRisk = value("escapeRisk") as AnimalProfile["escapeRisk"];
    if (!["low", "medium", "high"].includes(escapeRisk)) throw new Error("Invalid escape risk");
    const profile: AnimalProfile = { species: { ja: value("speciesJa"), en: value("speciesEn") }, scientificName: value("scientificName"), origin: { ja: value("originJa"), en: value("originEn") }, sizeClass: { ja: value("sizeJa"), en: value("sizeEn") }, weightGuide: { ja: value("weightJa"), en: value("weightEn") }, lifespanGuide: { ja: value("lifespanJa"), en: value("lifespanEn") }, traits: { ja: value("traitsJa"), en: value("traitsEn") }, brachycephalic: value("brachycephalic") === "yes", heatCaution: value("heatCaution") === "yes", escapeRisk, transportMethod: { ja: value("transportJa"), en: value("transportEn") }, kote: { ja: value("koteJa"), en: value("koteEn") } };
    await identityDispatcher({ action: "create_animal", createdBy: current.userUuid, animal: { tags: aliases("tags"), status, slug, name: { ja: value("nameJa"), en: value("nameEn") }, aliases: { ja: aliases("aliasesJa"), en: aliases("aliasesEn") }, summary: { ja: "", en: "" }, transport: { ja: "", en: "" }, crateNote: { ja: "", en: "" }, imageUrl: null, profile } });
    redirect("/main/admin/animals");
  }

  return <section className="adminContentPage adminPetPage adminPetNew">
    <Link className="adminPetBack" href="/main/admin/animals"><ArrowLeft aria-hidden="true" />{text.back}</Link>
    <header className="adminContentHeading"><h1>{text.title}</h1></header>
    <AnimalForm action={create} existingTags={existingTags} language={language} text={text} />
  </section>;
}
