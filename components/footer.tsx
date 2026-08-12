"use client";

import {
  Bot,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleUserRound,
  HelpCircle,
  Headset,
  Home,
  Menu,
  MessageCircle,
  PawPrint,
  RefreshCw,
  Settings,
  ShieldCheck,
  X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getCopyright } from "@/lib/content";

export function AppFooter() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [message, setMessage] = useState("");
  const [showMenuHint, setShowMenuHint] = useState(true);
  const [assistantMode, setAssistantMode] = useState<"bot" | "concierge">(
    "bot",
  );
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [workspaceCategory, setWorkspaceCategory] = useState("home");

  const workspaceCategories = [
    {
      id: "home",
      label: "ホーム",
      icon: Home,
      pages: [
        { label: "トップ", description: "現在の状況を確認" },
        { label: "マイページ", description: "登録情報を確認・変更" },
      ],
    },
    {
      id: "reservation",
      label: "予約",
      icon: CalendarDays,
      pages: [
        { label: "新しく予約", description: "送迎を新しく依頼" },
        { label: "予約一覧", description: "予約内容と履歴を確認" },
      ],
    },
    {
      id: "support",
      label: "サポート",
      icon: HelpCircle,
      pages: [
        { label: "クイックメニュー", description: "よく使う操作を表示" },
        { label: "お問い合わせ", description: "スタッフへ相談" },
      ],
    },
    {
      id: "settings",
      label: "設定",
      icon: Settings,
      pages: [
        { label: "アカウント", description: "ログイン情報を確認" },
        { label: "プライバシー", description: "安全と公開範囲を設定" },
      ],
    },
  ];

  const activeWorkspaceCategory =
    workspaceCategories.find((item) => item.id === workspaceCategory) ??
    workspaceCategories[0];
  const ActiveWorkspaceIcon = activeWorkspaceCategory.icon;

  useEffect(() => {
    if (!isWorkspaceOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsWorkspaceOpen(false);
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isWorkspaceOpen]);

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
          src="/icons/icon.svg?v=20260812"
          width={72}
          height={72}
          alt=""
          aria-hidden="true"
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
                  <button
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isWorkspaceOpen}
                    onClick={() => setIsWorkspaceOpen(true)}
                  >
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

      <div
        className={`userWorkspaceOverlay${isWorkspaceOpen ? " isOpen" : ""}`}
        aria-hidden={!isWorkspaceOpen}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            setIsWorkspaceOpen(false);
          }
        }}
      >
        <aside
          className="userWorkspaceDrawer"
          role="dialog"
          aria-modal="true"
          aria-label="ユーザーメニュー"
        >
          <header className="userWorkspaceHeader">
            <div>
              <span>MENU</span>
              <strong>サービスメニュー</strong>
            </div>
            <button
              type="button"
              aria-label="メニューを閉じる"
              onClick={() => setIsWorkspaceOpen(false)}
            >
              <X aria-hidden="true" />
            </button>
          </header>

          <div className="userWorkspaceTrail" aria-label="現在位置">
            <span>メニュー</span>
            <ChevronRight aria-hidden="true" />
            <strong>{activeWorkspaceCategory.label}</strong>
          </div>

          <div className="userWorkspaceBody">
            <nav className="userWorkspaceCategories" aria-label="カテゴリー">
              <p>カテゴリー</p>
              {workspaceCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={item.id === workspaceCategory ? "isActive" : ""}
                    key={item.id}
                    type="button"
                    onClick={() => setWorkspaceCategory(item.id)}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                );
              })}
            </nav>

            <section className="userWorkspacePages">
              <button
                className="userWorkspaceBack"
                type="button"
                onClick={() => setWorkspaceCategory("home")}
              >
                <ChevronLeft aria-hidden="true" />
                カテゴリー
              </button>
              <div className="userWorkspaceTitle">
                <ActiveWorkspaceIcon aria-hidden="true" />
                <div>
                  <span>選択中</span>
                  <h2>{activeWorkspaceCategory.label}</h2>
                </div>
              </div>
              <div className="userWorkspacePageList">
                {activeWorkspaceCategory.pages.map((page) => (
                  <button key={page.label} type="button">
                    <span>
                      <strong>{page.label}</strong>
                      <small>{page.description}</small>
                    </span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                ))}
              </div>
              <div className="userWorkspaceSafety">
                <ShieldCheck aria-hidden="true" />
                <span>安全にご利用いただけます</span>
              </div>
            </section>
          </div>
        </aside>
      </div>
    </footer>
  );
}
