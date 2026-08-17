export type PortalRole = "admin" | "partner" | "driver";
export type NavigationAccessTag = "owner" | "core" | "all";
export type NavigationTier = Exclude<NavigationAccessTag, "all">;

export type NavigationPage = {
  id: string;
  label: string;
  description: string;
  section?: "display" | "content" | "internal";
  allowedTiers?: readonly NavigationTier[];
};

export type NavigationGroup = {
  id: string;
  label: string;
  icon: "home" | "chat" | "bell" | "settings" | "wrench" | "calendar" | "truck" | "users" | "building" | "clipboard";
  allowedTiers?: readonly NavigationTier[];
  pages: NavigationPage[];
};

export function canAccessNavigation(
  allowedTiers: readonly NavigationTier[] | undefined,
  tier: string | undefined,
) {
  const normalizedTier = tier?.trim().toLowerCase();

  return (
    !allowedTiers ||
    (normalizedTier
      ? allowedTiers.some((allowedTier) => allowedTier === normalizedTier)
      : false)
  );
}

export function getNavigationAccessTags(
  allowedTiers: readonly NavigationTier[] | undefined,
): readonly NavigationAccessTag[] {
  return allowedTiers?.length ? allowedTiers : ["all"];
}

export const commonNavigation: NavigationGroup[] = [
  { id: "home", label: "ホーム", icon: "home", pages: [
    { id: "overview", label: "概要", description: "現在の状況を確認します。" },
  ] },
  { id: "chat", label: "チャット", icon: "chat", pages: [
    { id: "inbox", label: "受信トレイ", description: "届いたメッセージを確認します。" },
    { id: "robot", label: "Robo NEKOに相談", description: "Robo NEKOと対話しながら操作を進めます。" },
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
