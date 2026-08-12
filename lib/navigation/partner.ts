import type { NavigationGroup } from "./common";

export const partnerNavigation: NavigationGroup[] = [
  { id: "reservations", label: "予約管理", icon: "calendar", pages: [
    { id: "list", label: "予約一覧", description: "提携先の予約を確認します。" },
    { id: "new", label: "新規予約", description: "新しい予約を登録します。" },
  ] },
  { id: "dispatch", label: "運行確認", icon: "truck", pages: [
    { id: "status", label: "運行状況", description: "担当する運行状況を確認します。" },
  ] },
  { id: "staff", label: "スタッフ", icon: "building", pages: [
    { id: "members", label: "スタッフ一覧", description: "所属スタッフを確認します。" },
  ] },
];
