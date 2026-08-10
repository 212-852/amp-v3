"use client";

import {
  Bell,
  CircleUserRound,
  MessageCircle,
  Settings,
  X,
} from "lucide-react";
import { useState } from "react";

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
    </div>
  );
}
