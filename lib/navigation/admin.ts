import type { NavigationGroup } from "./common";

export const adminNavigation: NavigationGroup[] = [
  {
    id: "languages",
    label: "対応言語",
    icon: "wrench",
    allowedTiers: ["owner", "core"],
    pages: [
      {
        id: "supported",
        label: "対応言語",
        description: "ウェブアプリで利用できる言語を確認します。",
        allowedTiers: ["owner", "core"],
      },
    ],
  },
];
