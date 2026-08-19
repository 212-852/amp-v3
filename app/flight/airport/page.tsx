import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  Clock3,
  Home,
  Luggage,
  Mail,
  MapPin,
  PawPrint,
  Plane,
  Route,
  ShieldCheck,
  Truck,
} from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "日本国内の空港関連輸送 | PawsFlight Japan",
  description:
    "ご自宅と日本国内の空港間のペット輸送、空港での受け渡し、国際線・国内線への接続をPawsFlight Japanがサポートします。",
  icons: {
    icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }],
  },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム",
    breadcrumb: "日本国内の空港関連輸送",
    eyebrow: "Domestic Airport Transport",
    title: "日本国内の\n空港関連輸送",
    lead: "ご自宅と空港の間をつなぎ、国内線・国際線を利用する大切なペットの移動をサポートします。",
    note: "空港、航空会社、便、ペットの種類やサイズによって受付条件が異なります。旅程を確認したうえでご案内します。",
    serviceEyebrow: "Airport Support",
    serviceTitle: "空港まで、空港から。必要な区間をサポート。",
    serviceLead: "フライト前後の国内移動を、旅程に合わせて組み合わせていただけます。",
    services: [
      ["ご自宅から空港へ", "出発時刻と受付時間に合わせ、ご自宅や指定場所から空港まで輸送します。"],
      ["空港からご自宅へ", "到着後の受け取りに合わせ、空港からご自宅や指定場所まで輸送します。"],
      ["空港での受け渡し", "航空会社や貨物地区の受付条件を確認し、指定場所での引き渡しを調整します。"],
      ["国際線への接続", "海外渡航の出発・到着に合わせ、国内の空港アクセスを組み合わせます。"],
      ["羽田・成田間の移動", "空港間の乗り継ぎが必要な場合に、時間と条件を確認して輸送を調整します。"],
      ["クレートの確認", "ペットのサイズと航空会社の条件に合うクレートについてご相談いただけます。"],
    ],
    sceneEyebrow: "For Every Journey",
    sceneTitle: "このような移動にご利用いただけます",
    scenes: [
      ["海外渡航の出発・到着", "国際線の旅程に合わせた空港送迎と国内輸送。"],
      ["国内線を利用する移動", "国内線の受付・到着時間に合わせた空港アクセス。"],
      ["飼い主さまと別に移動", "ご家族や関係者との受け渡し条件を確認したペットのみの輸送。"],
    ],
    processEyebrow: "How It Works",
    processTitle: "ご相談から輸送まで",
    process: [
      ["旅程を確認", "利用空港、航空会社、便名、出発・到着時刻を伺います。"],
      ["ペットを確認", "種類、犬種・猫種、頭数、体重、クレートサイズを確認します。"],
      ["輸送計画をご案内", "受付時間から逆算し、集荷・受取時間とお見積もりをご案内します。"],
      ["当日の輸送", "運行状況を確認しながら、指定場所と空港の間を輸送します。"],
    ],
    formTitle: "空港関連輸送についてご相談ください",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
    inquiry: "無料相談・お見積もり",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home",
    breadcrumb: "Domestic airport transport",
    eyebrow: "Domestic Airport Transport",
    title: "Airport Transport\nAcross Japan",
    lead: "Careful ground transport between your home and airports in Japan for domestic and international journeys.",
    note: "Acceptance requirements vary by airport, airline, flight, animal, and size. We review your itinerary before confirming arrangements.",
    serviceEyebrow: "Airport Support",
    serviceTitle: "Support for the ground portion of your journey.",
    serviceLead: "Choose the domestic transport you need before departure or after arrival.",
    services: [
      ["Home to airport", "Pickup from your home or an agreed location, timed around airline acceptance."],
      ["Airport to home", "Collection after arrival and transport to your home or an agreed destination."],
      ["Airport handover", "Coordination for handover at the location specified by the airline or cargo facility."],
      ["International flight connections", "Domestic airport access coordinated around an international departure or arrival."],
      ["Haneda–Narita transfer", "Airport-to-airport transport planned around connection times and acceptance conditions."],
      ["Travel crate guidance", "Advice on a crate suited to your pet's size and the airline's requirements."],
    ],
    sceneEyebrow: "For Every Journey",
    sceneTitle: "Transport for a range of travel plans",
    scenes: [
      ["International departure or arrival", "Airport pickup and ground transport coordinated with an international itinerary."],
      ["Domestic air travel", "Airport access planned around domestic check-in and arrival times."],
      ["Pet traveling separately", "Pet-only transport with agreed handover arrangements for family or representatives."],
    ],
    processEyebrow: "How It Works",
    processTitle: "From consultation to transport",
    process: [
      ["Review the itinerary", "Share the airport, airline, flight number, and departure or arrival time."],
      ["Review your pet", "We confirm the animal, breed, number of pets, weight, and crate size."],
      ["Receive a transport plan", "We work backward from airline acceptance and outline pickup, handover, and estimated cost."],
      ["Travel day", "We monitor operating conditions and transport your pet between the airport and agreed location."],
    ],
    formTitle: "Talk to us about airport transport",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
    inquiry: "Free consultation & estimate",
  },
} as const;

const serviceIcons = [Home, Truck, Luggage, Plane, Route, ShieldCheck] as const;
const sceneIcons = [Plane, MapPin, PawPrint] as const;
const processIcons = [CalendarClock, ClipboardCheck, CheckCircle2, Clock3] as const;

export default async function AirportTransportPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, appConfig] = await Promise.all([
    searchParams,
    identityDispatcher({ action: "get_app_config" }).catch(() => null),
  ]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const contactHref = `/flight/contact?lang=${language}&service=airport`;
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." },
    language,
    "flight",
  );
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
            <nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold shadow-sm" aria-label="Language"><Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/airport?lang=ja" lang="ja">JA</Link><Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/airport?lang=en" lang="en">EN</Link></nav>
            <Link href={contactHref} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white lg:flex"><Mail size={17} aria-hidden="true" />{text.inquiry}</Link>
            <FlightMenu language={language} items={menuItems} contactLabel={text.inquiry} contactHref={contactHref} />
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#edf6ff_0%,#fff_58%,#e4f2ff_100%)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1240px]"><nav className="flex items-center gap-2 text-sm font-bold text-[#506783]" aria-label={language === "ja" ? "パンくずリスト" : "Breadcrumb"}><Link className="hover:text-[#1766ba]" href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} aria-hidden="true" /><span aria-current="page" className="text-[#073273]">{text.breadcrumb}</span></nav>
          <div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"><div><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.eyebrow}</p><h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.3] sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 max-w-[720px] text-base font-medium leading-8 text-[#506783] sm:text-lg">{text.lead}</p></div><div className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(7,50,115,0.1)]"><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#073273] text-white"><Truck size={32} aria-hidden="true" /></span><div><p className="font-bold text-[#398ee4]">AIRPORT TRANSPORT</p><p className="mt-1 text-xl font-bold">Home ↔ Airport</p></div></div><p className="mt-6 flex gap-3 text-sm font-bold leading-7 text-[#506783] sm:text-base"><PawPrint className="mt-1 shrink-0 text-[#398ee4]" size={22} aria-hidden="true" />{text.note}</p></div></div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="mx-auto max-w-[900px] text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.serviceEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.serviceTitle}</h2><p className="mt-5 font-medium leading-8 text-[#506783] sm:text-lg">{text.serviceLead}</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{text.services.map(([title, description], index) => { const Icon = serviceIcons[index]; return <article key={title} className="rounded-3xl border border-[#d9e9f8] bg-[#f9fcff] p-6 shadow-[0_14px_40px_rgba(7,50,115,0.06)]"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e7f3ff] text-[#1766ba]"><Icon size={27} aria-hidden="true" /></span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#506783] sm:text-base">{description}</p></article>; })}</div></div></section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.sceneEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.sceneTitle}</h2></div><div className="mt-12 grid gap-5 lg:grid-cols-3">{text.scenes.map(([title, description], index) => { const Icon = sceneIcons[index]; return <article key={title} className="rounded-3xl bg-white p-7 shadow-[0_16px_45px_rgba(7,50,115,0.08)]"><Icon className="text-[#398ee4]" size={32} aria-hidden="true" /><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 font-medium leading-7 text-[#506783]">{description}</p></article>; })}</div></div></section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1100px]"><div className="text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.processEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.processTitle}</h2></div><ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{text.process.map(([title, description], index) => { const Icon = processIcons[index]; return <li key={title} className="relative rounded-3xl border border-[#d9e9f8] p-6"><span className="absolute right-5 top-4 text-3xl font-bold text-[#d3e8fa]">{String(index + 1).padStart(2, "0")}</span><Icon className="text-[#1766ba]" size={29} aria-hidden="true" /><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#506783]">{description}</p></li>; })}</ol></div></section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">{consultationForm}</section>
      <footer className="bg-[#073273] px-5 py-10 text-white sm:px-8 sm:py-12"><div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-white/80 sm:text-sm" aria-label={language === "ja" ? "サイトマップ" : "Sitemap"}>{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} className="hover:text-white" href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link className="hover:text-white" href={contactHref}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/65 sm:text-sm"><span className="font-bold text-white/80">{text.footerServices}</span><a className="hover:text-white" href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a className="hover:text-white" href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} tone="light" /><p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">{copyrightText}</p></div></footer>
    </main>
  );
}
