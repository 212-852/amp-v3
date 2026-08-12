import { adminRobotProfile } from "@/lib/robot/admin";
import {
  resolveCommonReply,
  type RobotProfile,
  type RobotRole,
} from "@/lib/robot/common";
import { driverRobotProfile } from "@/lib/robot/driver";
import { partnerRobotProfile } from "@/lib/robot/partner";

const profiles: Record<RobotRole, RobotProfile> = {
  admin: adminRobotProfile,
  partner: partnerRobotProfile,
  driver: driverRobotProfile,
};

export function getRobotProfile(role: RobotRole) {
  return profiles[role];
}

export function robotDispatcher(role: RobotRole, message: string) {
  const normalizedMessage = message.trim().toLowerCase();
  const profile = profiles[role];

  return (
    resolveCommonReply(normalizedMessage) ??
    profile.reply(normalizedMessage) ??
    "内容を確認しました。必要な情報をもう少し詳しく教えてください。"
  );
}
