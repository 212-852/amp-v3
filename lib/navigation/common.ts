export type PortalRole = "admin" | "partner" | "driver";

export type NavigationPage = {
  id: string;
  label: string;
  description: string;
  allowedTiers?: readonly string[];
};

export type NavigationGroup = {
  id: string;
  label: string;
  icon: "home" | "chat" | "bell" | "settings" | "calendar" | "truck" | "users" | "building" | "clipboard";
  allowedTiers?: readonly string[];
  pages: NavigationPage[];
};

export function canAccessNavigation(
  allowedTiers: readonly string[] | undefined,
  tier: string | undefined,
) {
  const normalizedTier = tier?.trim().toLowerCase();

  return (
    !allowedTiers ||
    (normalizedTier ? allowedTiers.includes(normalizedTier) : false)
  );
}

export const commonNavigation: NavigationGroup[] = [
  { id: "home", label: "ホーム", icon: "home", pages: [
    { id: "overview", label: "概要", description: "現在の状況を確認します。" },
  ] },
  { id: "chat", label: "チャット", icon: "chat", pages: [
    { id: "inbox", label: "受信トレイ", description: "届いたメッセージを確認します。" },
    { id: "robot", label: "ロボ猫に相談", description: "ロボ猫と対話しながら操作を進めます。" },
  ] },
  { id: "notifications", label: "通知", icon: "bell", pages: [
    { id: "all", label: "すべての通知", description: "システムからの通知を確認します。" },
    { id: "unread", label: "未確認", description: "まだ確認していない通知を表示します。" },
  ] },
  { id: "settings", label: "設定", icon: "settings", pages: [
    { id: "profile", label: "プロフィール", description: "表示名などの基本情報を管理します。" },
    { id: "preferences", label: "表示設定", description: "画面表示や通知方法を設定します。" },
  ] },
];
