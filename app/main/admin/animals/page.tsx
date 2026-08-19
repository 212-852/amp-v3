import { ArrowDownUp, Pencil, PawPrint, Search, Trash2, X } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

import { AnimalForm } from "@/components/animalform";
import { identityDispatcher, resolveSessionCached, SESSION_COOKIE_NAME, type AnimalProfile } from "@/lib/identity";
import { animalSource, animalWorldCountryOptions, isAnimalStatus, slugify, splitCommaValues } from "@/lib/form";

const copy = {
  ja: {
    title: "動物データベース",
    search: "名称・別名・タグを検索", add: "新規登録",
    empty: "条件に一致する動物データがありません。", result: "件の登録",
    basic: "基本情報", details: "公開情報", nameJa: "名称（日本語）", nameEn: "名称（英語）", tags: "タグ", aliases: "別名・検索語", summaryJa: "特徴（日本語）", summaryEn: "特徴（英語）", crateJa: "クレート目安（日本語）", crateEn: "クレート目安（英語）", status: "公開状態", save: "登録する", hint: "カンマ区切りで複数入力できます。例：犬, 大型犬, 長毛",
    statuses: { draft: "下書き", published: "公開中", archived: "非公開" },
  },
  en: {
    title: "Animal database",
    search: "Search names, aliases, or tags", add: "New entry",
    empty: "No animal records match your search.", result: "records",
    basic: "Basic information", details: "Public information", nameJa: "Japanese name", nameEn: "English name", tags: "Tags", aliases: "Aliases / keywords", summaryJa: "Japanese profile", summaryEn: "English profile", crateJa: "Japanese crate guidance", crateEn: "English crate guidance", status: "Status", save: "Save record", hint: "Separate multiple tags with commas.",
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
  const session = token ? await resolveSessionCached(token) : null;
  const language = session?.language === "en" ? "en" : "ja";
  const text = copy[language];
  const animals = await identityDispatcher({ action: "list_animals", query });
  const countries = animalWorldCountryOptions();
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
    const status = value("status");
    const slug = slugify(value("nameEn"));
    if (!isAnimalStatus(status) || !slug || !value("nameJa") || !value("nameEn")) throw new Error("Invalid animal record");
    const values = (key: string) => splitCommaValues(value(key));
    const profile: AnimalProfile = { species: { ja: value("speciesJa"), en: value("speciesEn") }, scientificName: value("scientificName"), origin: { ja: value("originJa"), en: value("originEn") }, sizeClass: { ja: value("sizeJa"), en: value("sizeEn") }, weightGuide: { ja: value("weightJa"), en: value("weightEn") }, lifespanGuide: { ja: value("lifespanJa"), en: value("lifespanEn") }, traits: { ja: value("traitsJa"), en: value("traitsEn") }, source: animalSource(value("sourceUrl")) };
    await identityDispatcher({ action: "create_animal", animal: { tags: values("tags"), status, slug, name: { ja: value("nameJa"), en: value("nameEn") }, aliases: { ja: values("aliasesJa"), en: values("aliasesEn") }, profile } });
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
        <AnimalForm action={createAnimal} countries={countries} existingTags={existingTags} language={language} modal text={text} />
      </div>
      {query ? <div className="adminActiveSearch"><Search aria-hidden="true" /><span>{language === "ja" ? "検索中" : "Searching"}</span><strong>{query}</strong><Link href={sort === "name" ? "?sort=name" : "?sort=newest"} aria-label={language === "ja" ? "検索を解除" : "Clear search"} title={language === "ja" ? "検索を解除" : "Clear search"}><X aria-hidden="true" /></Link></div> : null}
    </header>

    {animals.length ? <div className="adminPetResults">
      {animals.map((animal) => <article className="adminPetResult" key={animal.animalUuid}>
        <div className="adminPetThumb"><PawPrint aria-hidden="true" /></div>
        <div className="adminPetResultBody">
          <div className="adminPetResultTitle"><div className="adminPetDetail"><h2>{animal.name[language] || animal.name.ja}</h2><small className={`status-${animal.status}`}>{text.statuses[animal.status]}</small><p>{animal.profile.traits[language] || animal.profile.traits.ja || animal.tags.join(" · ") || "—"}</p></div><div className="adminPetActions"><Link href={`/main/admin/animals/${animal.animalUuid}`} aria-label={language === "ja" ? "編集" : "Edit"} title={language === "ja" ? "編集" : "Edit"}><Pencil aria-hidden="true" /></Link>{isOwner ? <form action={removeAnimal}><input type="hidden" name="animalUuid" value={animal.animalUuid} /><button type="submit" aria-label={language === "ja" ? "削除" : "Delete"} title={language === "ja" ? "削除（ownerのみ）" : "Delete (owner only)"}><Trash2 aria-hidden="true" /></button></form> : null}</div></div>
          {animal.name.en && language === "ja" ? <p className="adminPetEnglish">{animal.name.en}</p> : null}
        </div>
      </article>)}
    </div> : <div className="adminContentEmpty adminPetEmpty"><Search aria-hidden="true" /><strong>{text.empty}</strong></div>}
  </section>;
}
