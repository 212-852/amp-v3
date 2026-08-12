import type { RobotProfile } from "@/lib/robot/common";

export const partnerRobotProfile: RobotProfile = {
  greeting: "こんにちは。パートナー業務についてお手伝いします。",
  menu: [
    { key: "reservations", label: "予約確認" },
    { key: "dispatch", label: "配車状況" },
    { key: "drivers", label: "スタッフ管理" },
    { key: "messages", label: "トーク・問い合わせ" },
    { key: "notifications", label: "通知" },
    { key: "settings", label: "設定" },
  ],
  reply(message) {
    if (message.includes("予約")) {
      return "予約の確認ですね。対象の日付やお客様名を教えてください。";
    }

    if (message.includes("スタッフ")) {
      return "スタッフについて、登録情報と稼働状況のどちらを確認しますか？";
    }

    return null;
  },
};
