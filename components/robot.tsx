"use client";

import {
  Bell,
  CalendarDays,
  CircleUserRound,
  ClipboardList,
  Handshake,
  MessageCircle,
  Route,
  Settings,
  Truck,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";

import { Modal } from "@/components/modal";

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
};

export function RobotNotice({ message }: RobotNoticeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const menuItems = [
    { label: "予約管理", icon: CalendarDays },
    { label: "配車管理", icon: Route },
    { label: "ユーザー管理", icon: Users },
    { label: "ドライバー管理", icon: Truck },
    { label: "パートナー管理", icon: Handshake },
    { label: "トーク・問い合わせ", icon: MessageCircle },
    { label: "通知", icon: Bell },
    { label: "設定", icon: Settings },
  ];

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
          <button
            className="adminMenuOpen"
            type="button"
            onClick={() => setIsMenuOpen(true)}
          >
            <ClipboardList aria-hidden="true" />
            管理メニュー
          </button>
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
          {menuItems.map(({ label, icon: Icon }) => (
            <button key={label} type="button">
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}
