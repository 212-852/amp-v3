import { ArrowDownUp, Pencil, PawPrint, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { AnimalForm } from "@/components/animalform";
import { identityDispatcher, SESSION_COOKIE_NAME, type AnimalProfile, type AnimalStatus } from "@/lib/identity";

const slugify = (value: string) => value.normalize("NFKD").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80);

const copy = {
  ja: {
    title: "動物データベース",
    search: "名称・別名・タグを検索", add: "新規登録",
    empty: "条件に一致する動物データがありません。", result: "件の登録",
    basic: "基本情報", details: "公開・輸送情報", nameJa: "名称（日本語）", nameEn: "名称（英語）", tags: "タグ", aliases: "別名・検索語", summaryJa: "特徴（日本語）", summaryEn: "特徴（英語）", transportJa: "輸送条件（日本語）", transportEn: "輸送条件（英語）", crateJa: "クレート目安（日本語）", crateEn: "クレート目安（英語）", status: "公開状態", save: "登録する", hint: "カンマ区切りで複数入力できます。例：犬、大型犬、長毛",
    statuses: { draft: "下書き", published: "公開中", archived: "非公開" },
  },
  en: {
    title: "Animal database",
    search: "Search names, aliases, or tags", add: "New entry",
    empty: "No animal records match your search.", result: "records",
    basic: "Basic information", details: "Public & transport information", nameJa: "Japanese name", nameEn: "English name", tags: "Tags", aliases: "Aliases / keywords", summaryJa: "Japanese profile", summaryEn: "English profile", transportJa: "Japanese transport guidance", transportEn: "English transport guidance", crateJa: "Japanese crate guidance", crateEn: "English crate guidance", status: "Status", save: "Save record", hint: "Separate multiple tags with commas.",
    statuses: { draft: "Draft", published: "Published", archived: "Archived" },
  },
} as const;

export const metadata = { title: "動物データベース | Admin" };
export const dynamic = "force-dynamic";

export default async function AnimalsPage({ searchParams }: PageProps<"/main/admin/animals">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const sort = params.sort === "name" ? "name" : "newest";
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await identityDispatcher({ action: "resolve_session", sessionToken: token }) : null;
  const language = session?.language === "en" ? "en" : "ja";
  const text = copy[language];
  const animals = await identityDispatcher({ action: "list_animals", query });
  const existingTags = Array.from(new Set(animals.flatMap((animal) => animal.tags).map((tag) => tag.trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, language));
  if (sort === "name") animals.sort((a, b) => (a.name[language] || a.name.ja).localeCompare(b.name[language] || b.name.ja, language));
  const isOwner = session?.role === "admin" && session.tier === "owner";

  async function createAnimal(formData: FormData) {
    "use server";
    const store = await cookies();
    const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;
    const current = sessionToken ? await identityDispatcher({ action: "resolve_session", sessionToken }) : null;
    if (!current || current.role !== "admin") throw new Error("Forbidden");
    const value = (key: string) => String(formData.get(key) ?? "").trim();
    const status = value("status") as AnimalStatus;
    const slug = slugify(value("nameEn"));
    if (!["draft", "published", "archived"].includes(status) || !slug || !value("nameJa") || !value("nameEn")) throw new Error("Invalid animal record");
    const split = (key: string) => Array.from(new Map(value(key).split(/[,、]/).map((item) => item.trim()).filter(Boolean).map((item) => [item.toLocaleLowerCase(), item])).values()).slice(0, 20);
    const escapeRisk = value("escapeRisk") as AnimalProfile["escapeRisk"];
    if (!["low", "medium", "high"].includes(escapeRisk)) throw new Error("Invalid escape risk");
    const profile: AnimalProfile = { species: { ja: value("speciesJa"), en: value("speciesEn") }, scientificName: value("scientificName"), origin: { ja: value("originJa"), en: value("originEn") }, sizeClass: { ja: value("sizeJa"), en: value("sizeEn") }, weightGuide: { ja: value("weightJa"), en: value("weightEn") }, lifespanGuide: { ja: value("lifespanJa"), en: value("lifespanEn") }, traits: { ja: value("traitsJa"), en: value("traitsEn") }, brachycephalic: value("brachycephalic") === "yes", heatCaution: value("heatCaution") === "yes", escapeRisk, transportMethod: { ja: value("transportJa"), en: value("transportEn") }, kote: { ja: value("koteJa"), en: value("koteEn") } };
    await identityDispatcher({ action: "create_animal", animal: { tags: split("tags"), status, slug, name: { ja: value("nameJa"), en: value("nameEn") }, aliases: { ja: split("aliasesJa"), en: split("aliasesEn") }, summary: { ja: "", en: "" }, transport: { ja: "", en: "" }, crateNote: { ja: "", en: "" }, profile } });
    revalidatePath("/main/admin/animals");
  }

  async function removeAnimal(formData: FormData) {
    "use server";
    const store = await cookies();
    const sessionToken = store.get(SESSION_COOKIE_NAME)?.value;
    const current = sessionToken ? await identityDispatcher({ action: "resolve_session", sessionToken }) : null;
    if (!current || current.role !== "admin" || current.tier !== "owner") throw new Error("Forbidden");
    const animalUuid = String(formData.get("animalUuid") ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(animalUuid)) throw new Error("Invalid animal");
    await identityDispatcher({ action: "delete_animal", animalUuid });
    revalidatePath("/main/admin/animals");
  }

  return <section className="adminContentPage adminPetPage">
    <header className="adminContentHeading">
      <h1>{text.title}</h1>
      <div className="adminListTools">
        <details className="adminListSearch"><summary aria-label={text.search} title={text.search}><Search aria-hidden="true" /></summary><form method="get"><label><Search aria-hidden="true" /><span className="srOnly">{text.search}</span><input name="q" type="search" defaultValue={query} placeholder={text.search} /></label><button type="submit">{language === "ja" ? "検索" : "Search"}</button></form></details>
        <Link className="adminListSort" href={`?${query ? `q=${encodeURIComponent(query)}&` : ""}sort=${sort === "name" ? "newest" : "name"}`} aria-label={language === "ja" ? "並び替え" : "Sort"} title={language === "ja" ? "並び替え" : "Sort"}><ArrowDownUp aria-hidden="true" /></Link>
        <AnimalForm action={createAnimal} existingTags={existingTags} language={language} modal text={text} />
      </div>
      {query ? <div className="adminActiveSearch"><Search aria-hidden="true" /><span>{language === "ja" ? "検索中" : "Searching"}</span><strong>{query}</strong><Link href={sort === "name" ? "?sort=name" : "?sort=newest"} aria-label={language === "ja" ? "検索を解除" : "Clear search"} title={language === "ja" ? "検索を解除" : "Clear search"}><X aria-hidden="true" /></Link></div> : null}
    </header>

    {animals.length ? <div className="adminPetResults">
      {animals.map((animal) => <article className="adminPetResult" key={animal.animalUuid}>
        <div className="adminPetThumb"><PawPrint aria-hidden="true" /></div>
        <div className="adminPetResultBody">
          <div className="adminPetResultTitle"><div className="adminPetDetail"><h2>{animal.name[language] || animal.name.ja}</h2><small className={`status-${animal.status}`}>{text.statuses[animal.status]}</small><p>{animal.summary[language] || animal.summary.ja || animal.tags.join(" · ") || "—"}</p></div><div className="adminPetActions"><Link href={`/main/admin/animals/${animal.animalUuid}`} aria-label={language === "ja" ? "編集" : "Edit"} title={language === "ja" ? "編集" : "Edit"}><Pencil aria-hidden="true" /></Link>{isOwner ? <form action={removeAnimal}><input type="hidden" name="animalUuid" value={animal.animalUuid} /><button type="submit" aria-label={language === "ja" ? "削除" : "Delete"} title={language === "ja" ? "削除（ownerのみ）" : "Delete (owner only)"}><Trash2 aria-hidden="true" /></button></form> : null}</div></div>
          {animal.name.en && language === "ja" ? <p className="adminPetEnglish">{animal.name.en}</p> : null}
        </div>
      </article>)}
    </div> : <div className="adminContentEmpty adminPetEmpty"><Search aria-hidden="true" /><strong>{text.empty}</strong></div>}
  </section>;
}
