import type { NavigationGroup } from "./common";

export const adminNavigation: NavigationGroup[] = [
  {
    id: "languages",
    label: "アプリ管理",
    icon: "wrench",
    allowedTiers: ["owner", "core"],
    pages: [
      {
        id: "company",
        label: "会社概要",
        description: "会社名と住所を日本語・英語で管理します。",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "copyright",
        label: "コピーライト",
        description: "開始年とサービス別の表示名を管理します。",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "supported",
        label: "言語",
        description: "ウェブアプリで利用できる言語を確認します。",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "structured",
        label: "SEO・構造化データ",
        description: "各サービス固有の検索情報とJSON-LDを管理します。",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "countries",
        label: "対応国",
        description: "国名、対応状況、表示順と掲載場所を管理します。",
        allowedTiers: ["owner", "core"],
      },
    ],
  },
];
