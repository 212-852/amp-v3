import { BookOpen, Cat, Dog, PawPrint, Plus, Search } from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

import { identityDispatcher, SESSION_COOKIE_NAME, type AnimalCategory } from "@/lib/identity";

const copy = {
  ja: {
    title: "動物データベース", description: "動物種・犬種・猫種と輸送情報を検索・管理します。",
    search: "動物種・犬種・猫種・別名を検索", add: "新規登録", all: "すべて",
    empty: "条件に一致する動物データがありません。", result: "件の登録",
    categories: { dog: "犬", cat: "猫", rabbit: "うさぎ", bird: "鳥", reptile: "爬虫類", other: "その他" },
    statuses: { draft: "下書き", published: "公開中", archived: "非公開" },
    transport: "輸送条件", noTransport: "輸送条件はまだ登録されていません。",
  },
  en: {
    title: "Animal database", description: "Search and manage species, breeds, and transport guidance.",
    search: "Search species, breeds, or aliases", add: "New entry", all: "All",
    empty: "No animal records match your search.", result: "records",
    categories: { dog: "Dogs", cat: "Cats", rabbit: "Rabbits", bird: "Birds", reptile: "Reptiles", other: "Other" },
    statuses: { draft: "Draft", published: "Published", archived: "Archived" },
    transport: "Transport", noTransport: "No transport guidance has been added.",
  },
} as const;

const categories: AnimalCategory[] = ["dog", "cat", "rabbit", "bird", "reptile", "other"];
const icon = (category: AnimalCategory) => category === "dog" ? <Dog aria-hidden="true" /> : category === "cat" ? <Cat aria-hidden="true" /> : <PawPrint aria-hidden="true" />;

export const metadata = { title: "動物データベース | Admin" };
export const dynamic = "force-dynamic";

export default async function AnimalsPage({ searchParams }: PageProps<"/main/admin/animals">) {
  const params = await searchParams;
  const query = typeof params.q === "string" ? params.q.slice(0, 80) : "";
  const category = typeof params.category === "string" && categories.includes(params.category as AnimalCategory)
    ? params.category as AnimalCategory : undefined;
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = token ? await identityDispatcher({ action: "resolve_session", sessionToken: token }) : null;
  const language = session?.language === "en" ? "en" : "ja";
  const text = copy[language];
  const animals = await identityDispatcher({ action: "list_animals", query, category });

  return <section className="adminContentPage adminPetPage">
    <header className="adminContentHeading">
      <div><h1>{text.title}</h1><p>{text.description}</p></div>
      <Link className="adminPetAdd" href="/main/admin/animals/new"><Plus aria-hidden="true" />{text.add}</Link>
    </header>

    <form className="adminPetSearch" method="get">
      <label className="adminContentSearch"><Search aria-hidden="true" /><span className="srOnly">{text.search}</span><input name="q" type="search" defaultValue={query} placeholder={text.search} /></label>
      <select name="category" defaultValue={category ?? ""} aria-label={text.all}>
        <option value="">{text.all}</option>
        {categories.map((value) => <option key={value} value={value}>{text.categories[value]}</option>)}
      </select>
      <button type="submit">{language === "ja" ? "検索" : "Search"}</button>
    </form>

    <div className="adminPetCount"><BookOpen aria-hidden="true" /><strong>{animals.length}</strong> {text.result}</div>
    {animals.length ? <div className="adminPetResults">
      {animals.map((animal) => <article className="adminPetResult" key={animal.animalUuid}>
        <div className="adminPetResultIcon">{icon(animal.category)}</div>
        <div className="adminPetResultBody">
          <div className="adminPetResultTitle"><span>{text.categories[animal.category]}</span><h2>{animal.name[language] || animal.name.ja}</h2><small className={`status-${animal.status}`}>{text.statuses[animal.status]}</small></div>
          {animal.name.en && language === "ja" ? <p className="adminPetEnglish">{animal.name.en}</p> : null}
          <p>{animal.summary[language] || animal.summary.ja}</p>
          <dl><dt>{text.transport}</dt><dd>{animal.transport[language] || animal.transport.ja || text.noTransport}</dd></dl>
        </div>
      </article>)}
    </div> : <div className="adminContentEmpty adminPetEmpty"><Search aria-hidden="true" /><strong>{text.empty}</strong></div>}
  </section>;
}
