import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  FileSignature,
  Mail,
  PackageCheck,
  PawPrint,
  Plane,
  Scale,
  ShieldCheck,
  UserCheck,
  Warehouse,
} from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "国内ペット貨物輸送 | PawsFlight Japan",
  description:
    "日本国内でペットのみを航空貨物として輸送する際の予約、必要書類、クレート、空港への持ち込みと受け取りをサポートします。",
  icons: {
    icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }],
  },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム",
    breadcrumb: "国内ペット貨物輸送",
    eyebrow: "Domestic Pet Air Cargo",
    title: "国内ペット\n貨物輸送",
    lead: "飼い主さまが搭乗せず、ペットのみを国内航空貨物として輸送するための準備と空港対応をサポートします。",
    note: "航空会社、路線、機材、季節、ペットの種類・犬種・健康状態によって受付条件が異なります。必ず事前確認が必要です。",
    serviceEyebrow: "Cargo Support",
    serviceTitle: "予約前の確認から、到着空港での受け取りまで。",
    serviceLead: "国内航空貨物に必要な準備を整理し、ペットの旅程に合わせてサポートします。",
    services: [
      ["輸送条件の確認", "利用予定の航空会社・路線と、動物種、犬種、年齢、健康状態に応じた受付条件を確認します。"],
      ["貨物便の予約・調整", "希望日と区間を伺い、利用可能な便や受付時間を確認して旅程を調整します。"],
      ["必要書類のご案内", "航空会社所定の申告書や、状況に応じて必要となる同意書・証明書をご案内します。"],
      ["クレート条件の確認", "ペットが安全に立つ・座る・向きを変えられるサイズと、航空会社の仕様を確認します。"],
      ["出発空港への持ち込み", "貨物受付の締切時刻に合わせ、空港貨物地区への搬送をご相談いただけます。"],
      ["到着空港での受け取り", "到着後の引き渡し時刻と受取人を確認し、必要に応じてその先の陸送も調整します。"],
    ],
    importantEyebrow: "Before Booking",
    importantTitle: "事前に確認する大切なポイント",
    important: [
      ["ペットの健康状態", "輸送に適した健康状態かを確認し、心配がある場合は事前に獣医師へご相談ください。"],
      ["短頭種・年齢などの制限", "犬種、年齢、気温などにより受付停止や条件が設けられる場合があります。"],
      ["貨物地区での手続き", "旅客ターミナルとは受付場所が異なる場合があります。場所と締切時刻を事前に確認します。"],
    ],
    processEyebrow: "How It Works",
    processTitle: "国内貨物輸送の流れ",
    process: [
      ["内容を確認", "出発・到着空港、希望日、ペット情報、受取人を伺います。"],
      ["便と条件を確認", "航空会社の受付可否、便、締切時刻、必要書類を確認します。"],
      ["出発準備", "クレート、給水、書類を整え、空港貨物地区で受付します。"],
      ["到着・受け取り", "到着後、指定された貨物窓口で受取人へ引き渡されます。"],
    ],
    inquiry: "無料相談・お見積もり",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home",
    breadcrumb: "Domestic pet air cargo",
    eyebrow: "Domestic Pet Air Cargo",
    title: "Domestic Pet\nAir Cargo",
    lead: "Support for pets traveling as domestic air cargo when their owner is not traveling on the same flight.",
    note: "Acceptance varies by airline, route, aircraft, season, animal, breed, and health condition. Advance confirmation is always required.",
    serviceEyebrow: "Cargo Support",
    serviceTitle: "From pre-booking checks to collection at arrival.",
    serviceLead: "We organize the preparation required for your pet's domestic air-cargo journey.",
    services: [
      ["Acceptance checks", "We review airline and route conditions based on animal, breed, age, and health."],
      ["Cargo booking coordination", "We review your preferred date and route, then confirm available flights and acceptance times."],
      ["Document guidance", "We explain airline declarations and any consent forms or certificates required for the journey."],
      ["Travel crate requirements", "We review airline specifications and space for your pet to stand, sit, and turn around."],
      ["Delivery to departure cargo", "Ground transport to the airport cargo facility can be arranged around the acceptance deadline."],
      ["Arrival collection", "We confirm the collection time and recipient and can coordinate onward ground transport if needed."],
    ],
    importantEyebrow: "Before Booking",
    importantTitle: "Important checks before travel",
    important: [
      ["Your pet's health", "Confirm that your pet is fit to travel and consult a veterinarian in advance if you have concerns."],
      ["Breed, age, and weather limits", "Airlines may restrict acceptance based on breed, age, temperature, or other conditions."],
      ["Cargo facility procedures", "Cargo acceptance may be separate from the passenger terminal. We confirm the location and deadline."],
    ],
    processEyebrow: "How It Works",
    processTitle: "Domestic cargo journey",
    process: [
      ["Share the details", "Tell us the airports, preferred date, pet information, and recipient."],
      ["Confirm flight and conditions", "We check airline acceptance, flight options, deadlines, and documents."],
      ["Prepare for departure", "Prepare the crate, water, and documents, then complete cargo acceptance."],
      ["Arrival and collection", "After arrival, the pet is handed to the designated recipient at the cargo counter."],
    ],
    inquiry: "Free consultation & estimate",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
  },
} as const;

const serviceIcons = [ShieldCheck, Plane, FileSignature, Scale, Warehouse, UserCheck] as const;
const importantIcons = [FileCheck2, ShieldCheck, Warehouse] as const;
const processIcons = [CalendarClock, ClipboardCheck, PackageCheck, CheckCircle2] as const;

export default async function CargoPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, appConfig] = await Promise.all([
    searchParams,
    identityDispatcher({ action: "get_app_config" }).catch(() => null),
  ]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const contactHref = `/flight/contact?lang=${language}&service=cargo`;
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." },
    language,
    "flight",
  );
  const consultationForm = await DirectionPage({
    params: Promise.resolve({ direction: "outbound" }),
    searchParams: Promise.resolve({ lang: language, standalone: "1", embed: "1", transport: "cargo" }),
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
      <header className="border-b border-[#d9e9f8] bg-white/95"><div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12"><Link href={`/flight?lang=${language}`} aria-label="PawsFlight Japan home"><Image className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority /></Link><nav className="hidden items-center gap-7 text-base font-bold xl:flex" aria-label={language === "ja" ? "メインナビゲーション" : "Main navigation"}>{menuItems.map((item, index) => <Link key={item.label} className={`whitespace-nowrap transition-colors hover:text-[#398ee4] ${index === 0 ? "text-[#398ee4]" : ""}`} href={item.href}>{item.label}</Link>)}</nav><div className="flex shrink-0 items-center gap-2 sm:gap-3"><nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold shadow-sm" aria-label="Language"><Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/cargo?lang=ja" lang="ja">JA</Link><Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/cargo?lang=en" lang="en">EN</Link></nav><Link href={contactHref} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white lg:flex"><Mail size={17} aria-hidden="true" />{text.inquiry}</Link><FlightMenu language={language} items={menuItems} contactLabel={text.inquiry} contactHref={contactHref} /></div></div></header>

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#edf6ff_0%,#fff_58%,#e4f2ff_100%)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20"><div className="mx-auto max-w-[1240px]"><nav className="flex items-center gap-2 text-sm font-bold text-[#506783]" aria-label={language === "ja" ? "パンくずリスト" : "Breadcrumb"}><Link className="hover:text-[#1766ba]" href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} aria-hidden="true" /><span aria-current="page" className="text-[#073273]">{text.breadcrumb}</span></nav><div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"><div><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.eyebrow}</p><h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.3] sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 max-w-[720px] text-base font-medium leading-8 text-[#506783] sm:text-lg">{text.lead}</p></div><div className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(7,50,115,0.1)]"><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#073273] text-white"><PackageCheck size={32} aria-hidden="true" /></span><div><p className="font-bold text-[#398ee4]">PET AIR CARGO</p><p className="mt-1 text-xl font-bold">Airport → Airport</p></div></div><p className="mt-6 flex gap-3 text-sm font-bold leading-7 text-[#506783] sm:text-base"><PawPrint className="mt-1 shrink-0 text-[#398ee4]" size={22} aria-hidden="true" />{text.note}</p></div></div></div></section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="mx-auto max-w-[900px] text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.serviceEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.serviceTitle}</h2><p className="mt-5 font-medium leading-8 text-[#506783] sm:text-lg">{text.serviceLead}</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{text.services.map(([title, description], index) => { const Icon = serviceIcons[index]; return <article key={title} className="rounded-3xl border border-[#d9e9f8] bg-[#f9fcff] p-6 shadow-[0_14px_40px_rgba(7,50,115,0.06)]"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e7f3ff] text-[#1766ba]"><Icon size={27} aria-hidden="true" /></span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#506783] sm:text-base">{description}</p></article>; })}</div></div></section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.importantEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.importantTitle}</h2></div><div className="mt-12 grid gap-5 lg:grid-cols-3">{text.important.map(([title, description], index) => { const Icon = importantIcons[index]; return <article key={title} className="rounded-3xl bg-white p-7 shadow-[0_16px_45px_rgba(7,50,115,0.08)]"><Icon className="text-[#398ee4]" size={32} aria-hidden="true" /><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 font-medium leading-7 text-[#506783]">{description}</p></article>; })}</div></div></section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1100px]"><div className="text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.processEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.processTitle}</h2></div><ol className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{text.process.map(([title, description], index) => { const Icon = processIcons[index]; return <li key={title} className="relative rounded-3xl border border-[#d9e9f8] p-6"><span className="absolute right-5 top-4 text-3xl font-bold text-[#d3e8fa]">{String(index + 1).padStart(2, "0")}</span><Icon className="text-[#1766ba]" size={29} aria-hidden="true" /><h3 className="mt-5 text-lg font-bold">{title}</h3><p className="mt-3 text-sm font-medium leading-7 text-[#506783]">{description}</p></li>; })}</ol></div></section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">{consultationForm}</section>
      <footer className="bg-[#073273] px-5 py-10 text-white sm:px-8 sm:py-12"><div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-white/80 sm:text-sm" aria-label={language === "ja" ? "サイトマップ" : "Sitemap"}>{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} className="hover:text-white" href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link className="hover:text-white" href={contactHref}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/65 sm:text-sm"><span className="font-bold text-white/80">{text.footerServices}</span><a className="hover:text-white" href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a className="hover:text-white" href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} tone="light" /><p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">{copyrightText}</p></div></footer>
    </main>
  );
}
