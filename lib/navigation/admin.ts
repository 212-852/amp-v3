import type { NavigationGroup } from "./common";

export const adminNavigation: NavigationGroup[] = [
  {
    id: "languages",
    label: "アプリ管理",
    icon: "wrench",
    allowedTiers: ["owner", "core"],
    pages: [
      {
        id: "supported",
        label: "言語",
        description: "ウェブアプリで利用できる言語を確認します。",
        allowedTiers: ["owner", "core"],
      },
      {
        id: "company",
        label: "会社概要",
        description: "会社名と住所を日本語・英語で管理します。",
        allowedTiers: ["owner", "core"],
      },
    ],
  },
];
