import type { NavigationGroup } from "./common";

export const adminNavigation: NavigationGroup[] = [
  { id: "reservations", label: "予約管理", icon: "calendar", pages: [
    { id: "list", label: "予約一覧", description: "予約を一覧で確認します。" },
    { id: "new", label: "新規予約", description: "新しい予約を登録します。" },
  ] },
  { id: "dispatch", label: "配車管理", icon: "truck", pages: [
    { id: "board", label: "配車状況", description: "現在の配車状況を確認します。" },
    { id: "assign", label: "配車割当", description: "予約にドライバーを割り当てます。" },
  ] },
  { id: "people", label: "アカウント管理", icon: "users", pages: [
    { id: "users", label: "ユーザー", description: "利用者情報を確認します。" },
    { id: "drivers", label: "ドライバー", description: "ドライバー情報を確認します。" },
    { id: "partners", label: "パートナー", description: "提携先情報を確認します。" },
  ] },
];
