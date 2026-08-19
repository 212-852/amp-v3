import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileCheck2,
  Languages,
  Mail,
  MapPin,
  PawPrint,
  Plane,
  ShieldCheck,
  Truck,
  UsersRound,
} from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "在日米軍関係者向けペット輸送 | PawsFlight Japan",
  description:
    "PCSや日本への赴任・帰国に伴うペット輸送を、英語対応で検疫準備から空港・基地周辺の輸送までサポートします。",
  icons: {
    icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }],
  },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム",
    breadcrumb: "在日米軍関係者向けペット輸送",
    eyebrow: "U.S. Military Family Support",
    title: "在日米軍関係者向け\nペット輸送",
    lead: "PCS・赴任・帰国など、日本国内外の異動に伴う大切なペットの移動を英語でもサポートします。",
    heroNote: "米軍基地への立ち入りや引き渡し方法は、基地・ご依頼内容・当日の条件を確認したうえでご案内します。",
    supportEyebrow: "How We Help",
    supportTitle: "異動に必要な準備を、ひとつの窓口で。",
    supportLead: "旅程とペットの状況を伺い、必要な手続きと輸送を組み合わせてご案内します。",
    supports: [
      ["英語でのご相談", "ご家族や担当者との連絡、輸送内容の確認を英語でも承ります。"],
      ["検疫・書類の準備", "日本と渡航先の条件を確認し、ワクチン・検査・証明書の準備を支援します。"],
      ["国際航空輸送", "航空貨物・受託手荷物など、旅程と条件に合う方法を整理します。"],
      ["空港・基地周辺の輸送", "ご自宅、空港、基地周辺の指定場所をつなぐ国内輸送をご相談いただけます。"],
      ["日本到着後の移動", "到着時の検疫後、空港からご自宅や指定場所までの輸送を調整します。"],
      ["複数頭・大型犬のご相談", "頭数、犬種、サイズ、クレート条件を確認し、実施可能な方法をご提案します。"],
    ],
    routesEyebrow: "Relocation Support",
    routesTitle: "日本への赴任も、日本からの異動も。",
    routes: [
      ["日本・基地周辺へ", "海外から日本への入国条件、事前届出、到着空港での検疫、国内輸送を確認します。"],
      ["日本から海外へ", "渡航先の入国条件、日本出国時の検疫、航空会社の条件、出発空港までの輸送を確認します。"],
      ["日本国内の異動", "基地周辺を含む日本国内の引越しや空港利用に合わせて、ペットの陸送をご案内します。"],
    ],
    processEyebrow: "Simple Process",
    processTitle: "ご相談からお引渡しまで",
    process: [
      ["旅程を共有", "異動日、出発地・到着地、利用予定の空港や基地をお知らせください。"],
      ["条件を確認", "ペット、検疫状況、航空会社、必要な輸送範囲を確認します。"],
      ["プランとお見積もり", "必要な準備、スケジュール、輸送方法、概算費用をご案内します。"],
      ["準備・輸送", "書類準備と各事業者との調整を進め、安全に配慮して輸送します。"],
    ],
    prepareTitle: "ご相談時にお知らせいただきたいこと",
    prepare: ["PCS・渡航の予定日", "出発地・到着地と基地名", "ペットの種類・犬種・頭数・体重", "マイクロチップ・ワクチン・検査の状況", "希望する受取・引渡場所と輸送方法"],
    ctaTitle: "PCSや異動の予定が決まったら、早めにご相談ください。",
    ctaLead: "渡航条件によっては準備に数か月かかる場合があります。現在分かる範囲からご案内します。",
    ctaAction: "無料相談・概算見積もり",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home",
    breadcrumb: "U.S. military pet transport",
    eyebrow: "U.S. Military Family Support",
    title: "Pet Transport for\nU.S. Military Families",
    lead: "English-language support for your pet's move during a PCS, assignment to Japan, or return overseas.",
    heroNote: "Base access and handover arrangements depend on the installation, requested service, and conditions on the day. We confirm the details before transport.",
    supportEyebrow: "How We Help",
    supportTitle: "One point of contact for your pet's move.",
    supportLead: "We review your itinerary and your pet's needs, then coordinate the right preparation and transport services.",
    supports: [
      ["Support in English", "Discuss your plans, confirm arrangements, and communicate with our team in English."],
      ["Quarantine and documents", "We help organize vaccination, testing, certificates, and destination requirements."],
      ["International air transport", "We review cargo, checked-baggage, and other options based on your itinerary."],
      ["Airport and base-area transport", "Ask us about ground transport between your home, airport, and an agreed location near your installation."],
      ["Transport after arrival", "After arrival quarantine, we can coordinate onward transport from the airport."],
      ["Multiple pets and large dogs", "We review breed, number, size, and crate requirements before suggesting available options."],
    ],
    routesEyebrow: "Relocation Support",
    routesTitle: "Moving to Japan, leaving Japan, or relocating locally.",
    routes: [
      ["Moving to Japan", "We review Japan's import requirements, advance notification, arrival quarantine, and onward transport."],
      ["Leaving Japan", "We review destination rules, Japan export quarantine, airline requirements, and transport to the departure airport."],
      ["Relocating within Japan", "We arrange ground transport for moves within Japan, including airport journeys and agreed base-area locations."],
    ],
    processEyebrow: "Simple Process",
    processTitle: "From first contact to handover",
    process: [
      ["Share your itinerary", "Tell us your move date, origin, destination, airport, and installation."],
      ["Review requirements", "We check your pet, quarantine status, airline, and required transport scope."],
      ["Plan and estimate", "We outline preparation, timing, transport options, and estimated costs."],
      ["Prepare and transport", "We coordinate documents and service partners, then transport your pet with care."],
    ],
    prepareTitle: "Information to share when you contact us",
    prepare: ["Expected PCS or travel date", "Origin, destination, and installation", "Animal, breed, number of pets, and weight", "Microchip, vaccination, and testing status", "Preferred pickup, handover, and transport method"],
    ctaTitle: "Contact us as soon as your PCS or move begins to take shape.",
    ctaLead: "Some destinations require several months of preparation. We can start with the information you have today.",
    ctaAction: "Free consultation & estimate",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
  },
} as const;

const supportIcons = [Languages, FileCheck2, Plane, Truck, ShieldCheck, UsersRound] as const;
const routeIcons = [MapPin, Plane, Truck] as const;
const processIcons = [CalendarDays, ClipboardList, BadgeCheck, CheckCircle2] as const;

export default async function MilitaryPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, appConfig] = await Promise.all([
    searchParams,
    identityDispatcher({ action: "get_app_config" }).catch(() => null),
  ]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." },
    language,
    "flight",
  );
  const contactHref = `/flight/contact?lang=${language}&service=military`;
  const consultationForm = await DirectionPage({
    params: Promise.resolve({ direction: "outbound" }),
    searchParams: Promise.resolve({ lang: language, standalone: "1", embed: "1" }),
  });
  const menuItems = text.nav.map((label, index) => ({
    label,
    href: index === 5
      ? `/flight/company?lang=${language}`
      : index === 1
        ? `/flight/guide?lang=${language}`
        : index === 2
          ? `/flight/pricing?lang=${language}`
          : index === 3
        ? `/flight/stories?lang=${language}`
        : index === 4
          ? `/flight/faq?lang=${language}`
          : `/flight?lang=${language}#${index === 0 ? "services" : "top"}`,
  }));

  return (
    <main className="min-h-dvh bg-[#f6f9fc] text-[#073273]" style={{ fontFamily: "var(--font-zen-maru-gothic)" }}>
      <header className="border-b border-[#d9e9f8] bg-white/95">
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link href={`/flight?lang=${language}`} aria-label="PawsFlight Japan home"><Image className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority /></Link>
          <nav className="hidden items-center gap-7 text-base font-bold xl:flex" aria-label={language === "ja" ? "メインナビゲーション" : "Main navigation"}>{menuItems.map((item, index) => <Link key={item.label} className={`whitespace-nowrap transition-colors hover:text-[#398ee4] ${index === 0 ? "text-[#398ee4]" : ""}`} href={item.href}>{item.label}</Link>)}</nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold shadow-sm" aria-label="Language">
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/military?lang=ja" lang="ja">JA</Link>
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/military?lang=en" lang="en">EN</Link>
            </nav>
            <Link href={contactHref} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)] lg:flex"><Mail size={17} aria-hidden="true" />{text.ctaAction}</Link>
            <FlightMenu language={language} items={menuItems} contactLabel={text.ctaAction} contactHref={contactHref} />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#edf6ff_0%,#fff_58%,#e9f4ff_100%)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
        <div className="absolute -right-24 top-10 h-72 w-72 rounded-full bg-[#b9ddff]/35 blur-3xl" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1240px]">
          <nav className="flex items-center gap-2 text-sm font-bold text-[#506783]" aria-label={language === "ja" ? "パンくずリスト" : "Breadcrumb"}><Link className="hover:text-[#1766ba]" href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} aria-hidden="true" /><span aria-current="page" className="text-[#073273]">{text.breadcrumb}</span></nav>
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.15fr_0.85fr]">
            <div><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.eyebrow}</p><h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.3] sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 max-w-[760px] text-base font-medium leading-8 text-[#506783] sm:text-lg">{text.lead}</p></div>
            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-7 shadow-[0_20px_60px_rgba(7,50,115,0.1)] backdrop-blur sm:p-9"><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#073273] text-white"><UsersRound size={32} aria-hidden="true" /></span><div><p className="font-bold text-[#398ee4]">PCS SUPPORT</p><p className="mt-1 text-xl font-bold">Japan ↔ Worldwide</p></div></div><p className="mt-6 flex gap-3 text-sm font-bold leading-7 text-[#506783] sm:text-base"><PawPrint className="mt-1 shrink-0 text-[#398ee4]" size={22} aria-hidden="true" />{text.heroNote}</p></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1240px]"><div className="mx-auto max-w-[900px] text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.supportEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.supportTitle}</h2><p className="mt-5 font-medium leading-8 text-[#506783] sm:text-lg">{text.supportLead}</p></div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{text.supports.map(([title, description], index) => { const Icon = supportIcons[index]; return <article key={title} className="rounded-3xl border border-[#d9e9f8] bg-[#f9fcff] p-6 shadow-[0_14px_40px_rgba(7,50,115,0.06)]"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e7f3ff] text-[#1766ba]"><Icon size={27} aria-hidden="true" /></span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#506783] sm:text-base">{description}</p></article>; })}</div>
        </div>
      </section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.routesEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.routesTitle}</h2></div><div className="mt-12 grid gap-5 lg:grid-cols-3">{text.routes.map(([title, description], index) => { const Icon = routeIcons[index]; return <article key={title} className="rounded-3xl bg-white p-7 shadow-[0_16px_45px_rgba(7,50,115,0.08)]"><Icon className="text-[#398ee4]" size={32} aria-hidden="true" /><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 font-medium leading-7 text-[#506783]">{description}</p></article>; })}</div></div></section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1100px]"><div className="text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.processEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.processTitle}</h2></div><ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{text.process.map(([title, description], index) => { const Icon = processIcons[index]; return <li key={title} className="relative rounded-3xl border border-[#d9e9f8] p-6"><span className="absolute right-5 top-4 text-3xl font-bold text-[#d3e8fa]">{String(index + 1).padStart(2, "0")}</span><Icon className="text-[#1766ba]" size={29} aria-hidden="true" /><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#506783]">{description}</p></li>; })}</ol></div></section>
      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">{consultationForm}</section>

      <footer className="bg-[#073273] px-5 py-10 text-white sm:px-8 sm:py-12"><div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-white/80 sm:text-sm" aria-label={language === "ja" ? "サイトマップ" : "Sitemap"}>{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} className="hover:text-white" href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link className="hover:text-white" href={contactHref}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/65 sm:text-sm"><span className="font-bold text-white/80">{text.footerServices}</span><a className="hover:text-white" href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a className="hover:text-white" href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} /><p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">{copyrightText}</p></div></footer>
    </main>
  );
}
