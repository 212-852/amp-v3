import type { RobotProfile } from "@/lib/robot/common";

export const driverRobotProfile: RobotProfile = {
  greeting: "こんにちは。今日の運行をお手伝いします。",
  menu: [
    { key: "schedule", label: "今日の予定" },
    { key: "dispatch", label: "配車確認" },
    { key: "messages", label: "運行トーク" },
    { key: "reports", label: "完了報告" },
    { key: "notifications", label: "通知" },
    { key: "settings", label: "設定" },
  ],
  reply(message) {
    if (message.includes("予定") || message.includes("今日")) {
      return "今日の予定を確認します。次の運行と一日の一覧のどちらを見ますか？";
    }

    if (message.includes("完了") || message.includes("報告")) {
      return "運行完了の報告ですね。対象の配車を教えてください。";
    }

    return null;
  },
};
