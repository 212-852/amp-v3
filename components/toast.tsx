"use client";

import {
  ArrowRight,
  ArrowUp,
  ExternalLink,
  Mail,
  Menu,
  MessageCircle,
  MessageSquareText,
  X,
} from "lucide-react";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import { type FormEvent, useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type ToastProps = {
  message: string | null;
  onClose: () => void;
  persistent?: boolean;
};

function subscribe() {
  return () => undefined;
}

export function Toast({ message, onClose, persistent = false }: ToastProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    if (!message || persistent) return;
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [message, onClose, persistent]);

  if (!mounted || !message) return null;

  return createPortal(
    <div className="greetingToast" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" aria-label="Close greeting" onClick={onClose}>×</button>
    </div>,
    document.body,
  );
}

type MailSendFormProps = {
  action: string;
  language: "ja" | "en";
  mailboxes: string[];
  text: {
    compose: string;
    from: string;
    to: string;
    subject: string;
    message: string;
    send: string;
  };
};

export function MailSendForm({ action, language, mailboxes, text }: MailSendFormProps) {
  const [sending, setSending] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending) return;
    setSending(true);
    const form = event.currentTarget;
    try {
      const response = await fetch(form.action, {
        method: "POST",
        body: new FormData(form),
        credentials: "same-origin",
      });
      window.location.assign(response.redirected ? response.url : `${window.location.pathname}?sendError=1`);
    } catch {
      setSending(false);
    }
  }

  return (
    <>
      <form action={action} aria-busy={sending} onSubmit={submit}>
        <h2>{text.compose}</h2>
        <label><span>{text.from}</span><select name="from" defaultValue={mailboxes[0] ?? ""} required>{mailboxes.length === 0 ? <option value="">{language === "en" ? "No sender available" : "送信元がありません"}</option> : null}{mailboxes.map((address) => <option value={address} key={address}>{address}</option>)}</select></label>
        <label><span>{text.to}</span><input name="to" type="email" autoComplete="email" required /></label>
        <label><span>{text.subject}</span><input name="subject" maxLength={240} required /></label>
        <label><span>{text.message}</span><textarea name="message" rows={8} maxLength={50000} required /></label>
        <button type="submit" disabled={sending}>{sending ? (language === "en" ? "Sending…" : "送信中…") : text.send}</button>
      </form>
      {mounted && sending ? createPortal(<div className="adminLoadingToast" role="status" aria-live="polite"><i aria-hidden="true" />{language === "en" ? "Sending your message…" : "メッセージを送信しています…"}</div>, document.body) : null}
    </>
  );
}

export function BackToTop({ label }: { label: string }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => setVisible(window.scrollY > 320);
    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });
    return () => window.removeEventListener("scroll", updateVisibility);
  }, []);

  function scrollToTop() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  }

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={scrollToTop}
      className={`fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 grid h-14 w-14 place-items-center rounded-full border border-[#b9daf7] bg-white/95 text-[#073273] shadow-[0_10px_30px_rgba(7,50,115,0.2)] backdrop-blur transition-[opacity,transform] duration-300 sm:bottom-7 sm:right-7 ${
        visible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUp size={24} strokeWidth={2.4} aria-hidden="true" />
    </button>
  );
}

type SocialChannelId = "sms" | "whatsapp" | "line" | "instagram";

type FlightSocialProps = {
  language: "ja" | "en";
  channels?: Record<SocialChannelId, string>;
  tone?: "light" | "dark";
  layout?: "icons" | "inline" | "floating";
  align?: "start" | "center" | "end";
};

const defaultFlightSocialChannels: Record<SocialChannelId, string> = {
  sms: process.env.NEXT_PUBLIC_FLIGHT_MESSAGES_URL ?? "",
  whatsapp: process.env.NEXT_PUBLIC_FLIGHT_WHATSAPP_URL ?? "",
  line: process.env.NEXT_PUBLIC_FLIGHT_LINE_URL ?? "",
  instagram: process.env.NEXT_PUBLIC_FLIGHT_INSTAGRAM_URL ?? "",
};

type SocialIconProps = SVGProps<SVGSVGElement> & { size?: number };

function WhatsAppIcon({ size = 24, ...props }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
      <path d="M20.3 11.7a8.3 8.3 0 0 1-12.2 7.2L3.5 20l1.2-4.4a8.3 8.3 0 1 1 15.6-3.9Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <path d="M8.1 7.7c.2-.5.5-.5.8-.5h.4c.2 0 .4.1.5.4l.8 1.9c.1.3.1.5-.1.7l-.7.8c-.2.2-.1.5.1.8.5.9 1.3 1.7 2.2 2.2.3.2.6.3.8.1l.9-1c.2-.2.4-.3.7-.2l1.9.9c.3.1.4.3.4.5 0 .4-.2 1.4-.8 1.9-.5.5-1.2.8-2 .8-1.2 0-2.9-.6-4.6-2.1-2.2-1.9-3.5-4.5-3.5-5.8 0-.6.1-1 .2-1.4Z" fill="currentColor" />
    </svg>
  );
}

function LineIcon({ size = 24, ...props }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
      <path d="M20.7 10.7c0 4-3.9 7.2-8.7 7.2-.7 0-1.4-.1-2.1-.2L6 20l.8-3.6c-2.2-1.3-3.5-3.4-3.5-5.7 0-4 3.9-7.2 8.7-7.2s8.7 3.2 8.7 7.2Z" stroke="currentColor" strokeWidth="1.9" strokeLinejoin="round" />
      <text x="12" y="12.6" fill="currentColor" fontSize="4.6" fontWeight="800" textAnchor="middle">LINE</text>
    </svg>
  );
}

function InstagramIcon({ size = 24, ...props }: SocialIconProps) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" {...props}>
      <rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5.2" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4.1" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.7" r="1.15" fill="currentColor" />
    </svg>
  );
}

const socialIcons = {
  sms: MessageSquareText,
  whatsapp: WhatsAppIcon,
  line: LineIcon,
  instagram: InstagramIcon,
} satisfies Record<SocialChannelId, ComponentType<SocialIconProps>>;

const socialIconColors: Record<SocialChannelId, { light: string; dark: string }> = {
  sms: { light: "text-white", dark: "text-[#285f96]" },
  whatsapp: { light: "text-white", dark: "text-[#39775f]" },
  line: { light: "text-white", dark: "text-[#3f7d5d]" },
  instagram: { light: "text-white", dark: "text-[#965f7b]" },
};

const socialCopy = {
  ja: {
    groupLabel: "SNSでのお問い合わせ",
    inlineLabel: "SNSで問い合わせしたい方",
    close: "問い合わせ方法を閉じる",
    open: "問い合わせ方法を開く",
    pending: "現在準備中です",
    action: "開く",
    channels: {
      sms: { title: "SMS", detail: "SMSでお問い合わせ" },
      whatsapp: { title: "WhatsApp", detail: "WhatsAppでお問い合わせ" },
      line: { title: "公式LINE", detail: "ウェブ" },
      instagram: { title: "Instagram", detail: "PawsVoyager" },
    },
  },
  en: {
    groupLabel: "Contact us through messaging services",
    inlineLabel: "Prefer to contact us through social media?",
    close: "Close contact option",
    open: "Open contact option",
    pending: "This option is coming soon",
    action: "Open",
    channels: {
      sms: { title: "SMS", detail: "Contact us by SMS" },
      whatsapp: { title: "WhatsApp", detail: "Contact us on WhatsApp" },
      line: { title: "Official LINE", detail: "Web" },
      instagram: { title: "Instagram", detail: "PawsVoyager" },
    },
  },
} as const;

export function FlightSocial({ language, channels = defaultFlightSocialChannels, tone = "light", layout = "icons", align = "center" }: FlightSocialProps) {
  const [selected, setSelected] = useState<SocialChannelId | null>(null);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const text = socialCopy[language];

  useEffect(() => {
    if (!selected) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelected(null);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selected]);

  const selectedCopy = selected ? text.channels[selected] : null;
  const selectedHref = selected ? channels[selected] : "";
  const SelectedIcon = selected ? socialIcons[selected] : MessageCircle;
  const selectedIconColor = selected ? socialIconColors[selected].dark : "text-[#285f96]";

  return (
    <>
      <div
        className={`${
          layout === "inline"
            ? "flex flex-wrap items-center justify-end gap-2"
            : layout === "floating"
              ? `mt-7 inline-flex items-center gap-3 sm:gap-4 ${align === "end" ? "justify-end" : align === "center" ? "justify-center" : "justify-start"}`
              : `mt-8 flex items-center gap-3 ${align === "start" ? "justify-start" : align === "end" ? "justify-end" : "justify-center"}`
        }`}
        role="group"
        aria-label={text.groupLabel}
      >
        {layout === "inline" ? (
          <span className={`mr-1 whitespace-nowrap text-sm font-bold ${tone === "dark" ? "text-[#355477]" : "text-white/85"}`}>
            {text.inlineLabel}
          </span>
        ) : null}
        {(Object.keys(socialIcons) as SocialChannelId[]).map((id) => {
          const Icon = socialIcons[id];
          const channel = text.channels[id];
          const iconColor = socialIconColors[id][tone];
          return (
            <button
              key={id}
              type="button"
              className={`grid place-items-center bg-transparent transition-[filter,transform] hover:-translate-y-1 hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-4 ${
                layout === "inline" ? "h-11 w-11" : layout === "floating" ? "h-12 w-12 sm:h-14 sm:w-14" : "h-14 w-14 sm:h-16 sm:w-16"
              } ${iconColor} ${tone === "dark" ? "focus-visible:outline-[#1766ba]" : "drop-shadow-[0_2px_7px_rgba(0,0,0,0.2)] focus-visible:outline-white"}`}
              aria-label={`${text.open}: ${channel.title}`}
              aria-haspopup="dialog"
              title={channel.title}
              onClick={() => setSelected(id)}
            >
              <Icon size={layout === "inline" ? 32 : layout === "floating" ? 35 : 38} strokeWidth={2.15} aria-hidden="true" />
            </button>
          );
        })}
      </div>

      {mounted && selected && selectedCopy
        ? createPortal(
            <div
              className="fixed inset-0 z-[1100] grid min-h-dvh place-items-start bg-[#041f49]/50 px-4 pt-[max(1rem,env(safe-area-inset-top))] backdrop-blur-sm motion-safe:animate-[flightOverlayShow_180ms_ease-out_both]"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setSelected(null);
              }}
            >
              <section
                className="relative mx-auto mt-3 w-full max-w-[430px] rounded-[2rem] border border-[#c9def2] bg-white px-6 pb-7 pt-6 text-center text-[#073273] shadow-[0_24px_70px_rgba(4,31,73,0.3)] motion-safe:animate-[flightModalDrop_680ms_cubic-bezier(0.22,0.76,0.3,1.16)_both] sm:mt-8 sm:px-8"
                role="dialog"
                aria-modal="true"
                aria-labelledby="flight-social-title"
              >
                <button
                  type="button"
                  autoFocus
                  className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-[#edf6ff] text-[#073273]"
                  aria-label={text.close}
                  onClick={() => setSelected(null)}
                >
                  <X size={23} aria-hidden="true" />
                </button>
                <span className={`mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#f2f6fa] ${selectedIconColor}`}>
                  <SelectedIcon size={30} strokeWidth={2} aria-hidden="true" />
                </span>
                <h3 id="flight-social-title" className="mt-4 text-2xl font-bold">{selectedCopy.title}</h3>
                <p className="mt-2 text-base font-semibold text-[#506783]">{selectedCopy.detail}</p>
                {selectedHref ? (
                  <a
                    href={selectedHref}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex min-h-13 items-center justify-center gap-2 rounded-full bg-[#073273] px-7 font-bold text-white"
                  >
                    {text.action}
                    <ExternalLink size={17} aria-hidden="true" />
                  </a>
                ) : (
                  <p className="mt-6 rounded-2xl bg-[#edf6ff] px-5 py-4 font-bold text-[#506783]">{text.pending}</p>
                )}
              </section>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}

type FlightMenuProps = {
  language: "ja" | "en";
  items: Array<{ label: string; href: string }>;
  contactLabel: string;
  contactHref?: string;
};

export function FlightMenu({ language, items, contactLabel, contactHref = `/flight/contact?lang=${language}` }: FlightMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <>
      <button
        type="button"
        className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-[#b7d8f6] bg-white/90 text-[#073273] shadow-sm lg:hidden"
        aria-label={language === "ja" ? "メニューを開く" : "Open menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen(true)}
      >
        <Menu size={24} aria-hidden="true" />
      </button>

      {mounted && isOpen
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] bg-[#041f49]/45 backdrop-blur-sm lg:hidden"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setIsOpen(false);
              }}
            >
              <aside
                className="ml-auto flex h-dvh w-[min(88vw,390px)] flex-col overflow-y-auto bg-white px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] text-[#073273] shadow-[-18px_0_55px_rgba(4,31,73,0.22)]"
                role="dialog"
                aria-modal="true"
                aria-label={language === "ja" ? "モバイルメニュー" : "Mobile menu"}
              >
                <div className="flex items-center justify-between border-b border-[#d9e9f8] pb-5">
                  <div>
                    <strong className="text-xl">PawsFlight Japan</strong>
                    {language === "ja" ? (
                      <p className="mt-1 text-xs font-bold text-[#506783]">パウズ・フライト・ジャパン</p>
                    ) : null}
                  </div>
                  <button
                    type="button"
                    className="grid h-12 w-12 place-items-center rounded-full bg-[#edf6ff]"
                    aria-label={language === "ja" ? "メニューを閉じる" : "Close menu"}
                    onClick={() => setIsOpen(false)}
                  >
                    <X size={25} aria-hidden="true" />
                  </button>
                </div>

                <nav className="grid py-5" aria-label={language === "ja" ? "メインメニュー" : "Main menu"}>
                  {items.map((item) => (
                    <Link
                      key={item.label}
                      className="flex min-h-16 items-center justify-between gap-4 border-b border-[#d9e9f8] px-1 text-lg font-bold"
                      href={item.href}
                      onClick={() => setIsOpen(false)}
                    >
                      {item.label}
                      <ArrowRight size={19} aria-hidden="true" />
                    </Link>
                  ))}
                </nav>

                <Link
                  className="mt-auto inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#073273] px-5 text-base font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)]"
                  href={contactHref}
                  onClick={() => setIsOpen(false)}
                >
                  <Mail size={18} aria-hidden="true" />
                  {contactLabel}
                </Link>
              </aside>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
