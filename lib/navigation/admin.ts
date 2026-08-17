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
        id: "pets",
        label: "ペット一覧",
        description: "犬種・猫種などのペット情報を管理します。",
        section: "content",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "gallery",
        label: "写真アップロード",
        description: "共通ギャラリーの写真と掲載先を管理します。",
        section: "content",
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
];
