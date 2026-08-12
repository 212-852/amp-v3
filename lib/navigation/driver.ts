import type { NavigationGroup } from "./common";

export const driverNavigation: NavigationGroup[] = [
  { id: "schedule", label: "運行予定", icon: "calendar", pages: [
    { id: "today", label: "今日の予定", description: "本日の運行予定を確認します。" },
    { id: "upcoming", label: "今後の予定", description: "これからの運行予定を確認します。" },
  ] },
  { id: "dispatch", label: "配車", icon: "truck", pages: [
    { id: "current", label: "現在の配車", description: "現在担当している配車を確認します。" },
  ] },
  { id: "reports", label: "報告", icon: "clipboard", pages: [
    { id: "daily", label: "運行報告", description: "運行結果を報告します。" },
  ] },
];
