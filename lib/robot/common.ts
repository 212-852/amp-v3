export type RobotRole = "admin" | "partner" | "driver";

export type RobotMenuKey =
  | "reservations"
  | "dispatch"
  | "users"
  | "drivers"
  | "partners"
  | "messages"
  | "notifications"
  | "settings"
  | "schedule"
  | "reports";

export type RobotMenuItem = {
  key: RobotMenuKey;
  label: string;
};

export type RobotProfile = {
  greeting: string;
  menu: RobotMenuItem[];
  reply: (message: string) => string | null;
};

const commonReplies = [
  {
    words: ["こんにちは", "おはよう", "こんばんは"],
    reply: "こんにちは。今日はどのようなお手伝いをしましょうか？",
  },
  {
    words: ["ヘルプ", "助けて", "使い方"],
    reply: "承知しました。知りたい操作や困っている内容を教えてください。",
  },
  {
    words: ["通知", "お知らせ"],
    reply: "通知を確認します。確認したい内容をもう少し詳しく教えてください。",
  },
];

export function resolveCommonReply(message: string) {
  const normalizedMessage = message.trim().toLowerCase();

  for (const item of commonReplies) {
    if (item.words.some((word) => normalizedMessage.includes(word))) {
      return item.reply;
    }
  }

  return null;
}
