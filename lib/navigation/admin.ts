import type { NavigationGroup } from "./common";

export const adminNavigation: NavigationGroup[] = [
  {
    id: "languages",
    label: "アプリ管理",
    icon: "sliders",
    allowedTiers: ["owner", "core"],
    pages: [
      {
        id: "company",
        label: "会社概要",
        description: "会社名と住所を日本語・英語で管理します。",
        section: "display",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "legal",
        label: "特商法",
        description: "販売条件と運営情報を管理します。",
        section: "display",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "terms",
        label: "利用規約",
        description: "サービスの利用条件を管理します。",
        section: "display",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "privacy",
        label: "プライバシーポリシー",
        description: "個人情報の取り扱いを管理します。",
        section: "display",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "cancellation",
        label: "キャンセルポリシー",
        description: "キャンセル・返金条件を管理します。",
        section: "display",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "countries",
        label: "対応国",
        description: "国名、対応状況、表示順を管理します。",
        section: "display",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "copyright",
        label: "コピーライト",
        description: "開始年とサービス別の表示名を管理します。",
        section: "internal",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "supported",
        label: "言語",
        description: "ウェブアプリで利用できる言語を確認します。",
        section: "internal",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "structured",
        label: "SEO",
        description: "各サービス固有の検索情報とJSON-LDを管理します。",
        section: "internal",
        allowedTiers: ["owner", "core"],
      },
    ],
  },
  {
    id: "pets",
    label: "動物データベース",
    icon: "paw",
    href: "/main/admin/pets",
    allowedTiers: ["owner", "core"],
    pages: [
      {
        id: "pets",
        label: "動物データベース",
        description: "犬・猫・うさぎ・亀など、動物の種類と関連情報を管理します。",
        allowedTiers: ["owner", "core"],
      },
    ],
  },
];
