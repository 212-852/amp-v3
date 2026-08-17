"use client";

import {
  Bot,
  BookOpenText,
  Building2,
  ChevronRight,
  CircleUserRound,
  HelpCircle,
  Headset,
  Home,
  Menu,
  MessageCircle,
  PawPrint,
  RefreshCw,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useLanguage } from "@/components/language";
import { getCopyright } from "@/lib/content";
import { getTranslation, type Translation } from "@/lib/i18n";

export function AppFooter() {
  const router = useRouter();
  const pathname = usePathname();
  const { language, companyName, copyright } = useLanguage();
  const text = (translation: Translation) => getTranslation(translation, language);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [assistantMode, setAssistantMode] = useState<"bot" | "concierge">(
    "bot",
  );
  const [isWorkspaceOpen, setIsWorkspaceOpen] = useState(false);
  const [workspaceCategory, setWorkspaceCategory] = useState("support");
  const isHomePage = pathname === "/" || pathname === "/main" || pathname === "/liff";
  const copyrightText = getCopyright(copyright, companyName, language, "main");

  const workspaceCategories = [
    {
      id: "home",
      label: text({ ja: "ホーム", en: "Home" }),
      icon: Home,
      pages: [],
    },
    {
      id: "company",
      label: text({ ja: "運営会社", en: "Company" }),
      icon: Building2,
      pages: [
        {
          label: text({ ja: "会社概要", en: "Company profile" }),
          description: text({ ja: "運営会社の基本情報を確認", en: "View company information" }),
          href: "/company",
        },
        {
          label: text({ ja: "特商法表記", en: "Legal notice" }),
          description: text({ ja: "各サービスの取引条件を確認", en: "Review transaction terms for each service" }),
          href: "/legal",
        },
        {
          label: text({ ja: "運営サービス", en: "Services" }),
          description: text({ ja: "運営中のサービスを確認", en: "View our services" }),
        },
      ],
    },
    {
      id: "terms",
      label: text({ ja: "利用規約", en: "Legal" }),
      icon: BookOpenText,
      pages: [
        {
          label: text({ ja: "利用規約", en: "Terms of service" }),
          description: text({ ja: "サービスの利用条件を確認", en: "Review the terms of service" }),
        },
        {
          label: text({ ja: "プライバシーポリシー", en: "Privacy policy" }),
          description: text({ ja: "個人情報の取り扱いを確認", en: "Review how personal information is handled" }),
        },
        {
          label: text({ ja: "キャンセルポリシー", en: "Cancellation policy" }),
          description: text({ ja: "キャンセル・返金条件を確認", en: "Review cancellation and refund terms" }),
        },
      ],
    },
    {
      id: "support",
      label: text({ ja: "サポート", en: "Support" }),
      icon: HelpCircle,
      pages: [
        {
          label: text({ ja: "よくある質問", en: "FAQ" }),
          description: text({ ja: "サービスに関する回答を確認", en: "Find answers about the service" }),
        },
        {
          label: text({ ja: "国内外空輸サポート", en: "Domestic and international air transport support" }),
          description: text({ ja: "国内外の空輸やペット輸送について相談", en: "Ask about domestic and international air transport" }),
        },
        {
          label: text({ ja: "お問い合わせ", en: "Contact us" }),
          description: text({ ja: "スタッフへ相談", en: "Contact our staff" }),
        },
      ],
    },
  ];

  const activeWorkspaceCategory =
    workspaceCategories.find((item) => item.id === workspaceCategory) ??
    workspaceCategories[0];

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

  useEffect(() => {
    const timer = window.setTimeout(() => setIsMenuOpen(!isHomePage), 0);
    return () => window.clearTimeout(timer);
  }, [isHomePage]);

  function handleFooterFlip() {
    setIsMenuOpen((current) => !current);
  }

  return (
    <footer className={`appFooter${isHomePage ? " appFooterHome" : " appFooterPage"}`}>
      {!isHomePage ? (
        <div className="footerCharacters" aria-hidden="true">
          <Image
            className="footerCharacter footerDog"
            src="/images/main/dog-character.svg"
            width={300}
            height={300}
            alt=""
            unoptimized
          />
          <Image
            className="footerCharacter footerCat"
            src="/images/main/cat-character.svg"
            width={300}
            height={300}
            alt=""
            unoptimized
          />
        </div>
      ) : null}

      <svg
        className="footerWave"
        viewBox="0 0 1440 150"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 102C195 42 334 13 514 40c199 30 278 101 493 94 161-5 269-43 433-58v74H0Z" />
      </svg>

      {isHomePage ? (
        <button
          className="footerAssistantButton footerFixedAssistant"
          type="button"
          aria-label={isMenuOpen
            ? text({ ja: "チャットを表示", en: "Show chat" })
            : text({ ja: "メニューを表示", en: "Show menu" })}
          aria-expanded={isMenuOpen}
          onClick={handleFooterFlip}
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
      ) : null}

      <div className="footerScene">
        <div className={`footerCard${isMenuOpen || !isHomePage ? " footerCardFlipped" : ""}`}>
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

              <small className="footerCopyright">{copyrightText}</small>
            </div>
          </div>

          <div className="footerFace footerBack">
            <div className="footerMenuContent">
              <div className="footerAssistantSpace" aria-hidden="true" />

              <div className="footerMenuPanel">
                {isHomePage ? <div className="footerModeSwitch" aria-label="Assistant mode">
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
                </div> : null}

                <nav className="footerMenuNav" aria-label="Footer menu">
                  {isHomePage ? <>
                    <button type="button">
                      <CircleUserRound aria-hidden="true" />
                      <span>{text({ ja: "マイページ", en: "My Page" })}</span>
                    </button>
                    <button type="button">
                      <MessageCircle aria-hidden="true" />
                      <span>{text({ ja: "クイックメニュー", en: "Quick Menu" })}</span>
                    </button>
                  </> : null}
                  <button
                    className={!isHomePage ? "footerPageMenuButton" : undefined}
                    type="button"
                    aria-haspopup="dialog"
                    aria-expanded={isWorkspaceOpen}
                    onClick={() => setIsWorkspaceOpen(true)}
                  >
                    {isHomePage ? <Menu aria-hidden="true" /> : <PawPrint aria-hidden="true" />}
                    <span>{isHomePage
                      ? text({ ja: "メニュー", en: "Menu" })
                      : "MENU"}</span>
                    {!isHomePage ? <PawPrint aria-hidden="true" /> : null}
                  </button>
                </nav>
              </div>

              {isHomePage ? <Bot className="footerBotIcon" aria-hidden="true" /> : null}
              <small className="footerCopyright">{copyrightText}</small>
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
            <div className="userWorkspaceHeading">
              <span className="userWorkspaceHeadingPaw" aria-hidden="true">
                <PawPrint />
              </span>
              <strong>{text({ ja: "メニュー", en: "MENU" })}</strong>
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
            <span>{text({ ja: "メニュー", en: "Menu" })}</span>
            <ChevronRight aria-hidden="true" />
            <strong>{activeWorkspaceCategory.label}</strong>
          </div>

          <div className="userWorkspaceBody">
            <nav className="userWorkspaceCategories" aria-label="カテゴリー">
              {workspaceCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    className={item.id === workspaceCategory ? "isActive" : ""}
                    key={item.id}
                    type="button"
                    onClick={() => {
                      if (item.id === "home") {
                        setIsWorkspaceOpen(false);
                        router.push(pathname.startsWith("/main") ? "/main" : "/");
                        return;
                      }

                      setWorkspaceCategory(item.id);
                    }}
                  >
                    <Icon aria-hidden="true" />
                    <span>{item.label}</span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                );
              })}
            </nav>

            <section className="userWorkspacePages">
              <div className="userWorkspacePageList">
                {activeWorkspaceCategory.pages.map((page) => (
                  <button
                    key={page.label}
                    type="button"
                    onClick={() => {
                      if (!("href" in page) || !page.href) return;
                      setIsWorkspaceOpen(false);
                      const target = pathname.startsWith("/main")
                        ? `/main${page.href}`
                        : page.href;
                      router.push(target);
                    }}
                  >
                    <span>
                      <strong>{page.label}</strong>
                      <small>{page.description}</small>
                    </span>
                    <ChevronRight aria-hidden="true" />
                  </button>
                ))}
              </div>
            </section>
          </div>
        </aside>
      </div>
    </footer>
  );
}
