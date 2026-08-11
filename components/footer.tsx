"use client";

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
        <svg
          className="footerAssistantIcon"
          viewBox="0 0 251.538 251.538"
          aria-hidden="true"
        >
          <g
            fill="none"
            stroke="#7a4e22"
            strokeWidth="21.3185"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M61.888 75.222c-8.991-4.109-19.16-1.138-22.713 6.639-3.556 7.776-.392 18.969 8.599 23.079s20.405-.421 23.958-8.198c3.552-7.774-.853-17.41-9.844-21.52z" />
            <path d="M95.747 90.166c11.299 5.164 28.302-.824 33.355-11.882 5.052-11.055-3.611-25.053-14.909-30.219-11.299-5.164-24.701 1.673-29.753 12.728-5.056 11.059.008 24.21 11.307 29.373z" />
            <path d="M153.127 115.33c12.148 5.553 26.668 8.347 32.357-3.296 8.283-16.958-.574-36.431-12.725-41.984-12.15-5.553-26.366-.501-31.752 11.284-5.388 11.785-.03 28.443 12.12 33.996z" />
            <path d="M211.731 157.011c4.886-10.693.799-25.698-9.285-30.308s-22.219.32-27.108 11.013c-4.888 10.692 2.426 25.042 12.509 29.652 10.084 4.612 18.998.336 23.884-10.357z" />
            <path d="M155.165 143.73c-11.763-31.033-40.444-36.249-40.444-36.249s-47.777-3.475-63.269 30.93c-9.827 21.826-.091 43.74 31.109 56.983 73.575 31.225 84.97-18.04 72.604-51.664z" />
          </g>
          <g fill="#ff8aa1">
            <path d="M61.888 75.222c-8.991-4.109-19.16-1.138-22.713 6.639-3.556 7.776-.392 18.969 8.599 23.079s20.405-.421 23.958-8.198c3.552-7.774-.853-17.41-9.844-21.52z" />
            <path d="M95.747 90.166c11.299 5.164 28.302-.824 33.355-11.882 5.052-11.055-3.611-25.053-14.909-30.219-11.299-5.164-24.701 1.673-29.753 12.728-5.056 11.059.008 24.21 11.307 29.373z" />
            <path d="M153.127 115.33c12.148 5.553 26.668 8.347 32.357-3.296 8.283-16.958-.574-36.431-12.725-41.984-12.15-5.553-26.366-.501-31.752 11.284-5.388 11.785-.03 28.443 12.12 33.996z" />
            <path d="M211.731 157.011c4.886-10.693.799-25.698-9.285-30.308s-22.219.32-27.108 11.013c-4.888 10.692 2.426 25.042 12.509 29.652 10.084 4.612 18.998.336 23.884-10.357z" />
            <path d="M155.165 143.73c-11.763-31.033-40.444-36.249-40.444-36.249s-47.777-3.475-63.269 30.93c-9.827 21.826-.091 43.74 31.109 56.983 73.575 31.225 84.97-18.04 72.604-51.664z" />
          </g>
        </svg>
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
