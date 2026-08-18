import {
  BookOpen,
  Camera,
  Cat,
  ChevronRight,
  Dog,
  ImagePlus,
  PawPrint,
  Plus,
  Search,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import { cookies } from "next/headers";

import { identityDispatcher, SESSION_COOKIE_NAME } from "@/lib/identity";

const copy = {
  ja: {
    title: "動物データベース",
    description: "犬・猫・うさぎ・亀など、動物の種類と関連情報を一つにつないで管理します。",
    tabs: {
      dictionary: "動物データベース",
      customers: "お客様のペット",
      stories: "写真・輸送事例",
    },
    dictionary: {
      search: "動物種・犬種・猫種を検索",
      add: "種類を追加",
      heading: "動物種から種類を管理",
      help: "公開できる特徴・輸送条件・代表画像を登録し、顧客の選択肢とSEOページに共通利用します。",
      dog: "犬",
      dogGroup: "レトリーバー系",
      breed: "ゴールデン・レトリーバー",
      details: "特徴・輸送条件・代表画像",
      cat: "猫",
      other: "その他の動物",
      seo: "公開ページでは、種類ごとの特徴・輸送時の注意・クレート目安・実際の輸送事例をまとめます。",
    },
    customers: {
      search: "ペット名・飼い主ID・種類を検索",
      add: "お客様のペットを追加",
      heading: "お客様のペット",
      help: "飼い主のユーザーIDと種類を紐付け、表記のずれを防ぎます。",
      empty: "登録されたお客様のペットはまだありません。",
      fields: "動物種／犬種・猫種／ミックス／名前／年齢／体重／飼い主ID",
    },
    stories: {
      search: "ペット名・事例・サービスを検索",
      add: "写真・輸送事例を追加",
      heading: "写真・輸送事例",
      help: "写真は単独保存せず、種類の代表画像・お客様のペット・輸送事例のいずれかに紐付けます。",
      empty: "登録された写真・輸送事例はまだありません。",
      links: "紐付け先：犬種・猫種／お客様のペット／輸送事例",
    },
  },
  en: {
    title: "Animal database",
    description: "Connect animal species, breeds, customer pets, photos, and transport stories in one place.",
    tabs: {
      dictionary: "Animal database",
      customers: "Customer pets",
      stories: "Photos & stories",
    },
    dictionary: {
      search: "Search species or breeds",
      add: "Add breed",
      heading: "Manage by animal species",
      help: "Reuse descriptions, transport conditions, and representative images for customer choices and public SEO pages.",
      dog: "Dogs",
      dogGroup: "Retrievers",
      breed: "Golden Retriever",
      details: "Profile, transport conditions, and representative image",
      cat: "Cats",
      other: "Other animals",
      seo: "Public pages can combine breed traits, transport notes, crate guidance, and actual transport stories.",
    },
    customers: {
      search: "Search pet name, owner ID, or breed",
      add: "Add customer pet",
      heading: "Customer pets",
      help: "Link each pet to its owner ID and standardized breed entry.",
      empty: "No customer pets have been added yet.",
      fields: "Species / breed / mix / name / age / weight / owner ID",
    },
    stories: {
      search: "Search pet, story, or service",
      add: "Add photo or story",
      heading: "Photos & transport stories",
      help: "Every photo belongs to a breed profile, customer pet, or transport story instead of being stored alone.",
      empty: "No photos or transport stories have been added yet.",
      links: "Link to: breed / customer pet / transport story",
    },
  },
} as const;

type PetTab = "dictionary" | "customers" | "stories";

export const metadata = { title: "動物データベース | Admin" };

export default async function PetsPage({ searchParams }: PageProps<"/main/admin/pets">) {
  const params = await searchParams;
  const requestedTab = typeof params.tab === "string" ? params.tab : "dictionary";
  const tab: PetTab = requestedTab === "customers" || requestedTab === "stories" ? requestedTab : "dictionary";
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  const session = sessionToken
    ? await identityDispatcher({ action: "resolve_session", sessionToken })
    : null;
  const text = copy[session?.language === "en" ? "en" : "ja"];
  const panel = text[tab];

  return (
    <section className="adminContentPage adminPetPage">
      <header className="adminContentHeading">
        <div><h1>{text.title}</h1><p>{text.description}</p></div>
      </header>

      <nav className="adminPetTabs" aria-label={text.title}>
        <Link className={tab === "dictionary" ? "isActive" : ""} href="?tab=dictionary">
          <BookOpen aria-hidden="true" />{text.tabs.dictionary}
        </Link>
        <Link className={tab === "customers" ? "isActive" : ""} href="?tab=customers">
          <UserRound aria-hidden="true" />{text.tabs.customers}
        </Link>
        <Link className={tab === "stories" ? "isActive" : ""} href="?tab=stories">
          <Camera aria-hidden="true" />{text.tabs.stories}
        </Link>
      </nav>

      <div className="adminPetPanelHeading">
        <div>
          <h2>{panel.heading}</h2>
          <p>{panel.help}</p>
        </div>
        <button type="button"><Plus aria-hidden="true" />{panel.add}</button>
      </div>

      <label className="adminContentSearch">
        <Search aria-hidden="true" />
        <span className="srOnly">{panel.search}</span>
        <input type="search" placeholder={panel.search} />
      </label>

      {tab === "dictionary" ? (
        <div className="adminPetDictionary">
          <button className="adminPetSpecies" type="button">
            <Dog aria-hidden="true" /><strong>{text.dictionary.dog}</strong><ChevronRight aria-hidden="true" />
          </button>
          <div className="adminPetBranch" aria-label={text.dictionary.dog}>
            <span>{text.dictionary.dogGroup}</span><ChevronRight aria-hidden="true" />
            <div className="adminPetBreed">
              <PawPrint aria-hidden="true" />
              <div><strong>{text.dictionary.breed}</strong><small>{text.dictionary.details}</small></div>
              <ChevronRight aria-hidden="true" />
            </div>
          </div>
          <button className="adminPetSpecies" type="button">
            <Cat aria-hidden="true" /><strong>{text.dictionary.cat}</strong><ChevronRight aria-hidden="true" />
          </button>
          <button className="adminPetSpecies" type="button">
            <PawPrint aria-hidden="true" /><strong>{text.dictionary.other}</strong><ChevronRight aria-hidden="true" />
          </button>
          <aside className="adminPetNote"><BookOpen aria-hidden="true" /><p>{text.dictionary.seo}</p></aside>
        </div>
      ) : (
        <div className="adminContentEmpty adminPetEmpty">
          {tab === "customers" ? <UserRound aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
          <strong>{tab === "customers" ? text.customers.empty : text.stories.empty}</strong>
          <p>{tab === "customers" ? text.customers.fields : text.stories.links}</p>
        </div>
      )}
    </section>
  );
}
