import type { RobotProfile } from "@/lib/robot/common";

export const adminRobotProfile: RobotProfile = {
  greeting: "こんにちは。管理画面で行いたいことを教えてください。",
  menu: [
    { key: "reservations", label: "予約管理" },
    { key: "dispatch", label: "配車管理" },
    { key: "users", label: "ユーザー管理" },
    { key: "drivers", label: "ドライバー管理" },
    { key: "partners", label: "パートナー管理" },
    { key: "messages", label: "トーク・問い合わせ" },
    { key: "notifications", label: "通知" },
    { key: "settings", label: "設定" },
  ],
  reply(message) {
    if (message.includes("予約")) {
      return "予約状況を確認します。日付や予約者など、確認したい条件を教えてください。";
    }

    if (message.includes("配車")) {
      return "配車について確認します。未配車、運行中、完了のどれを確認しますか？";
    }

    if (message.includes("ドライバー")) {
      return "ドライバー管理ですね。登録、稼働状況、担当配車のどれを確認しますか？";
    }

    return null;
  },
};
