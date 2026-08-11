"use client";

import Image from "next/image";
import {
  Bot,
  CircleUserRound,
  Headset,
  Menu,
  MessageCircle,
  PawPrint,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import { getCopyright } from "@/lib/content";

export function AppFooter() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [showMenuHint, setShowMenuHint] = useState(true);
  const [assistantMode, setAssistantMode] = useState<"bot" | "concierge">(
    "bot",
  );

  function handleMenuToggle() {
    setIsMenuOpen((current) => !current);
    setShowMenuHint(false);
  }

  return (
    <footer className="appFooter">
      <svg
        className="footerWave"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 102C195 42 334 13 514 40c199 30 278 101 493 94 161-5 269-43 433-58v74H0Z" />
      </svg>

      <button
        className="footerAssistantButton footerFixedAssistant"
        type="button"
        aria-label={isMenuOpen ? "Show message input" : "Show footer menu"}
        aria-expanded={isMenuOpen}
        aria-describedby={showMenuHint ? "footerMenuHint" : undefined}
        onClick={handleMenuToggle}
      >
        <Image
          className="footerAssistantIcon"
          src="/icons/icon.svg?v=3"
          alt=""
          width={58}
          height={58}
          priority
          unoptimized
        />
        <span className="footerRefresh">
          <RefreshCw aria-hidden="true" />
        </span>
      </button>

      {showMenuHint && !isMenuOpen ? (
        <span id="footerMenuHint" className="footerMenuHint">
          メニュー切替
        </span>
      ) : null}

      <div className="footerScene">
        <div className={`footerCard${isMenuOpen ? " footerCardFlipped" : ""}`}>
          <div className="footerFace footerFront">
            <div className="footerContent">
              <div className="footerAssistantSpace" aria-hidden="true" />

              <form
                id="footerMessageForm"
                className="footerMessageArea"
                onSubmit={(event) => event.preventDefault()}
              >
                <div className="footerResponderStatus" aria-live="polite">
                  {assistantMode === "bot" ? (
                    <Bot aria-hidden="true" />
                  ) : (
                    <Headset aria-hidden="true" />
                  )}
                  <span>
                    {assistantMode === "bot" ? "BOT" : "CONCIERGE"}
                  </span>
                </div>

                <input
                  className="footerMessageBar"
                  type="text"
                  value={message}
                  aria-label="Message"
                  placeholder="Type a message"
                  autoComplete="off"
                  onChange={(event) => setMessage(event.target.value)}
                />
              </form>

              <button
                className="footerPawButton"
                type="submit"
                form="footerMessageForm"
                aria-label="Send message"
                disabled={!message.trim()}
              >
                <PawPrint className="footerDecorativePaw" aria-hidden="true" />
              </button>

              <small>{getCopyright()}</small>
            </div>
          </div>

          <div className="footerFace footerBack">
            <div className="footerMenuContent">
              <div className="footerAssistantSpace" aria-hidden="true" />

              <div className="footerMenuPanel">
                <div className="footerModeSwitch" aria-label="Assistant mode">
                  <button
                    className={assistantMode === "bot" ? "footerModeActive" : ""}
                    type="button"
                    aria-pressed={assistantMode === "bot"}
                    onClick={() => setAssistantMode("bot")}
                  >
                    Bot
                  </button>
                  <button
                    className={
                      assistantMode === "concierge" ? "footerModeActive" : ""
                    }
                    type="button"
                    aria-pressed={assistantMode === "concierge"}
                    onClick={() => setAssistantMode("concierge")}
                  >
                    Concierge
                  </button>
                </div>

                <nav className="footerMenuNav" aria-label="Footer menu">
                  <button type="button">
                    <CircleUserRound aria-hidden="true" />
                    <span>My Page</span>
                  </button>
                  <button type="button">
                    <MessageCircle aria-hidden="true" />
                    <span>Quick Menu</span>
                  </button>
                  <button type="button">
                    <Menu aria-hidden="true" />
                    <span>Menu</span>
                  </button>
                </nav>
              </div>

              <Bot className="footerBotIcon" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
