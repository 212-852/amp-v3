"use client";

import {
  Bell,
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  Handshake,
  MessageCircle,
  Send,
  Route,
  Settings,
  Truck,
  Users,
  X,
} from "lucide-react";
import { type FormEvent, useState } from "react";

import { Modal } from "@/components/modal";
import {
  getRobotProfile,
  robotDispatcher,
} from "@/lib/robot/dispatcher";
import type { RobotMenuKey, RobotRole } from "@/lib/robot/common";

type PortalToolbarProps = {
  displayName: string;
  chatMode: "icon" | "toggle";
};

export function PortalToolbar({
  displayName,
  chatMode,
}: PortalToolbarProps) {
  const [isChatEnabled, setIsChatEnabled] = useState(true);

  return (
    <>
      <div className="adminIdentity">
        <CircleUserRound aria-hidden="true" />
        <strong>{displayName}</strong>
      </div>

      <div className="adminTools">
        {chatMode === "toggle" ? (
          <button
            className="adminChatToggle"
            type="button"
            aria-label={`Turn chat ${isChatEnabled ? "off" : "on"}`}
            aria-pressed={isChatEnabled}
            onClick={() => setIsChatEnabled((current) => !current)}
          >
            <MessageCircle aria-hidden="true" />
            <span className="adminToggleState">
              {isChatEnabled ? "ON" : "OFF"}
            </span>
          </button>
        ) : (
          <button className="adminToolButton" type="button" aria-label="Chat">
            <MessageCircle aria-hidden="true" />
          </button>
        )}

        <button className="adminToolButton" type="button" aria-label="Settings">
          <Settings aria-hidden="true" />
        </button>

        <button
          className="adminToolButton"
          type="button"
          aria-label="Notifications"
        >
          <Bell aria-hidden="true" />
          <span className="adminAlertDot" />
        </button>
      </div>
    </>
  );
}

type RobotNoticeProps = {
  message: string;
  role: RobotRole;
};

export function RobotNotice({ message, role }: RobotNoticeProps) {
  const profile = getRobotProfile(role);
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTalkOpen, setIsTalkOpen] = useState(false);
  const [talkMessage, setTalkMessage] = useState("");
  const [talkMessages, setTalkMessages] = useState<
    Array<{ sender: "robot" | "admin"; text: string }>
  >([
    {
      sender: "robot",
      text: profile.greeting,
    },
  ]);

  const menuIcons: Record<RobotMenuKey, typeof Bell> = {
    reservations: CalendarDays,
    dispatch: Route,
    users: Users,
    drivers: Truck,
    partners: Handshake,
    messages: MessageCircle,
    notifications: Bell,
    settings: Settings,
    schedule: CalendarDays,
    reports: ClipboardList,
  };

  function handleTalkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = talkMessage.trim();

    if (!text) {
      return;
    }

    setTalkMessages((current) => [
      ...current,
      { sender: "admin", text },
      {
        sender: "robot",
        text: robotDispatcher(role, text),
      },
    ]);
    setTalkMessage("");
  }

  return (
    <div className={`adminRobotCall${isOpen ? " adminRobotCallOpen" : ""}`}>
      <button
        className="adminRobotButton"
        type="button"
        aria-label={isOpen ? "Close notifications" : "Open notifications"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span
          className="adminRobot"
          role="img"
          aria-label="Robot cat blinking"
        />
        <span className="adminRobotDot" aria-hidden="true" />
      </button>

      <section className="adminNotice" role="status" aria-live="polite">
        <svg
          className="adminNoticeTail"
          viewBox="0 0 52 32"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M51 2C35 4 24 18 4 29c18 0 36-8 46-18Z" />
        </svg>
        <div className="adminNoticeText">
          <strong>New notification</strong>
          <span>{message}</span>
          <div className="adminNoticeActions">
            <button
              className="adminMenuOpen"
              type="button"
              onClick={() => setIsMenuOpen(true)}
            >
              <ClipboardList aria-hidden="true" />
              管理メニュー
            </button>
            <button
              className="adminMenuOpen"
              type="button"
              onClick={() => setIsTalkOpen(true)}
            >
              <MessageCircle aria-hidden="true" />
              ロボ猫を呼び出す
            </button>
          </div>
        </div>
        <div className="adminNoticeMeta">
          <time>Now</time>
          <button
            type="button"
            aria-label="Close notification"
            onClick={() => setIsOpen(false)}
          >
            <X aria-hidden="true" />
          </button>
        </div>
      </section>

      <Modal
        label="管理メニュー"
        open={isMenuOpen}
        overlayClassName="adminModalOverlay"
        panelClassName="adminMenuModal"
        title="管理メニュー"
        onClose={() => setIsMenuOpen(false)}
      >
        <p className="adminMenuLead">行いたい管理を選択してください</p>
        <div className="adminMenuGrid">
          {profile.menu.map(({ key, label }) => {
            const Icon = menuIcons[key];

            return <button key={key} type="button">
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>;
          })}
        </div>
      </Modal>

      <Modal
        label="ロボ猫とのトーク"
        open={isTalkOpen}
        overlayClassName="adminTalkOverlay"
        panelClassName="adminTalkPanel"
        title="ロボ猫と話す"
        onClose={() => setIsTalkOpen(false)}
      >
        <div className="adminTalkRobot" aria-hidden="true">
          <span className="adminRobot" />
        </div>

        <div className="adminTalkMessages" aria-live="polite">
          {talkMessages.map((item, index) => (
            <p
              className={`adminTalkMessage adminTalkMessage${
                item.sender === "robot" ? "Robot" : "Admin"
              }`}
              key={`${item.sender}-${index}`}
            >
              {item.text}
            </p>
          ))}
        </div>

        <form className="adminTalkForm" onSubmit={handleTalkSubmit}>
          <input
            type="text"
            value={talkMessage}
            aria-label="ロボ猫へのメッセージ"
            placeholder="ロボ猫に相談する"
            autoComplete="off"
            onChange={(event) => setTalkMessage(event.target.value)}
          />
          <button
            type="submit"
            aria-label="メッセージを送信"
            disabled={!talkMessage.trim()}
          >
            <Send aria-hidden="true" />
          </button>
        </form>
      </Modal>
    </div>
  );
}
