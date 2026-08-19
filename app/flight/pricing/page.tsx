import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  Box,
  Calculator,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  FileCheck2,
  Mail,
  MapPin,
  PawPrint,
  Plane,
  ReceiptText,
} from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "料金 | PawsFlight Japan",
  description: "PawsFlight Japanの国際・国内ペット輸送のお見積もりと料金を決める要素をご案内します。",
  icons: { icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }] },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム", breadcrumb: "料金", eyebrow: "Pricing", title: "ペット輸送の料金", lead: "渡航先、ペット、輸送方法、必要な手続きに合わせて、個別にお見積もりします。",
    note: "国際ペット輸送には一律料金がありません。条件を確認したうえで、必要な項目と概算費用を分かりやすくご案内します。",
    estimateTitle: "個別お見積もり", estimateLead: "以下の条件を確認して料金を算出します。",
    factors: [["出発地・到着地", "国・地域、利用空港、国内の集荷・配達場所"], ["ペットの情報", "種類、犬種・猫種、頭数、体重、健康状態"], ["クレート", "必要なサイズ、仕様、手配の有無"], ["航空輸送方法", "貨物、受託手荷物、ハンドキャリーなど"], ["検疫・書類", "ワクチン、検査、証明書、届出のサポート範囲"], ["渡航日・季節", "便の状況、繁忙期、気温による受付条件"]],
    includedTitle: "お見積もりで確認する主な項目", included: ["航空輸送・貨物運賃", "検疫条件と必要書類の確認", "国内の空港関連輸送", "輸送用クレート", "空港での受付・受取対応", "海外・国内の提携事業者との調整"],
    extraTitle: "別途費用となる場合があるもの", extras: ["動物病院での診察・ワクチン・検査", "政府機関や検査機関の証明・申請費用", "保管・待機・再手配にかかる費用", "旅程変更や航空会社都合による追加手配", "到着地での通関・配送・代理店費用"],
    flowTitle: "お見積もりの流れ", flow: [["情報を送る", "分かる範囲で旅程とペット情報をご入力ください。"], ["条件を確認", "検疫、航空会社、輸送区間、必要書類を確認します。"], ["概算をご案内", "必要な準備と料金項目を整理してご案内します。"]],
    inquiry: "無料相談・お見積もり", footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"], footerServices: "その他サービス", footerServiceLinks: ["ペットタクシー", "空港シャトル"], footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home", breadcrumb: "Pricing", eyebrow: "Pricing", title: "Pet Transport Pricing", lead: "Every estimate is prepared around the destination, pet, transport method, and required procedures.",
    note: "International pet transport does not have a single flat rate. We review the conditions and provide a clear estimate of the required items.",
    estimateTitle: "Individual estimate", estimateLead: "Pricing is calculated after reviewing the following factors.",
    factors: [["Origin and destination", "Countries, airports, and domestic pickup or delivery locations"], ["Pet information", "Animal, breed, number of pets, weight, and health"], ["Travel crate", "Required size, specifications, and whether one must be arranged"], ["Air transport method", "Cargo, checked baggage, hand carry, or another confirmed method"], ["Quarantine and documents", "Vaccinations, tests, certificates, notifications, and support scope"], ["Travel date and season", "Flight availability, busy periods, and temperature restrictions"]],
    includedTitle: "Main items reviewed in an estimate", included: ["Air transportation or cargo charges", "Quarantine and document review", "Domestic airport-related transport", "Travel crate", "Airport acceptance and collection", "Coordination with domestic and overseas partners"],
    extraTitle: "Items that may be charged separately", extras: ["Veterinary examination, vaccination, and testing", "Government or laboratory certificate and application fees", "Storage, waiting, and rebooking charges", "Changes or additional airline arrangements", "Destination customs, delivery, and agent charges"],
    flowTitle: "Estimate process", flow: [["Share your information", "Provide your itinerary and pet information to the extent known."], ["We review the conditions", "We check quarantine, airlines, transport legs, and documents."], ["Receive an estimate", "We outline the preparation and estimated pricing items."]],
    inquiry: "Free consultation & estimate", footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"], footerServices: "Other services", footerServiceLinks: ["Pet Taxi", "Airport Shuttle"], footerContact: "Contact us",
  },
} as const;

const factorIcons = [MapPin, PawPrint, Box, Plane, FileCheck2, CalendarClock] as const;
const flowIcons = [ReceiptText, Calculator, CheckCircle2] as const;

export default async function PricingPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, appConfig] = await Promise.all([searchParams, identityDispatcher({ action: "get_app_config" }).catch(() => null)]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const contactHref = `/flight/contact?lang=${language}`;
  const copyrightText = getCopyright(appConfig?.copyright ?? defaultCopyright, appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." }, language, "flight");
  const consultationForm = await DirectionPage({ params: Promise.resolve({ direction: "outbound" }), searchParams: Promise.resolve({ lang: language, standalone: "1", embed: "1" }) });
  const menuItems = text.nav.map((label, index) => ({ label, href: index === 5 ? `/flight/company?lang=${language}` : index === 1 ? `/flight/guide?lang=${language}` : index === 2 ? `/flight/pricing?lang=${language}` : index === 3 ? `/flight/stories?lang=${language}` : index === 4 ? `/flight/faq?lang=${language}` : `/flight?lang=${language}#${index === 0 ? "services" : "top"}` }));

  return <main className="min-h-dvh bg-[#f6f9fc] text-[#073273]" style={{ fontFamily: "var(--font-zen-maru-gothic)" }}>
    <header className="border-b border-[#d9e9f8] bg-white/95"><div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12"><Link href={`/flight?lang=${language}`}><Image className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority /></Link><nav className="hidden items-center gap-7 font-bold xl:flex">{menuItems.map((item, index) => <Link key={item.label} className={index === 2 ? "text-[#398ee4]" : "hover:text-[#398ee4]"} href={item.href} aria-current={index === 2 ? "page" : undefined}>{item.label}</Link>)}</nav><div className="flex items-center gap-2"><nav className="flex rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold"><Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "ja" ? "bg-[#073273] text-white" : ""}`} href="/flight/pricing?lang=ja">JA</Link><Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "en" ? "bg-[#073273] text-white" : ""}`} href="/flight/pricing?lang=en">EN</Link></nav><Link href={contactHref} className="hidden min-h-12 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white lg:flex"><Mail size={17} />{text.inquiry}</Link><FlightMenu language={language} items={menuItems} contactLabel={text.inquiry} contactHref={contactHref} /></div></div></header>

    <section className="bg-[linear-gradient(135deg,#edf6ff_0%,#fff_58%,#e4f2ff_100%)] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="mx-auto max-w-[1240px]"><nav className="flex items-center gap-2 text-sm font-bold text-[#506783]"><Link href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} /><span>{text.breadcrumb}</span></nav><div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"><div><p className="text-xl font-bold tracking-[.14em] text-[#398ee4]">{text.eyebrow}</p><h1 className="mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 text-lg font-medium leading-8 text-[#506783]">{text.lead}</p></div><div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(7,50,115,.1)]"><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#073273] text-white"><CircleDollarSign size={33} /></span><div><p className="font-bold text-[#398ee4]">CUSTOM ESTIMATE</p><p className="mt-1 text-xl font-bold">{text.estimateTitle}</p></div></div><p className="mt-6 flex gap-3 font-bold leading-7 text-[#506783]"><PawPrint className="shrink-0 text-[#398ee4]" />{text.note}</p></div></div></div></section>

    <section className="bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="text-center"><p className="text-xl font-bold tracking-[.14em] text-[#398ee4]">Pricing Factors</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.estimateTitle}</h2><p className="mt-4 text-[#506783]">{text.estimateLead}</p></div><div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{text.factors.map(([title, description], index) => { const Icon = factorIcons[index]; return <article key={title} className="rounded-3xl border border-[#d9e9f8] bg-[#f9fcff] p-6"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e7f3ff] text-[#1766ba]"><Icon size={26} /></span><h3 className="mt-5 text-xl font-bold">{title}</h3><p className="mt-3 font-medium leading-7 text-[#506783]">{description}</p></article>; })}</div></div></section>

    <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-[1100px] gap-6 lg:grid-cols-2"><article className="rounded-[2rem] bg-white p-8"><h2 className="text-2xl font-bold">{text.includedTitle}</h2><ul className="mt-6 grid gap-4">{text.included.map((item) => <li key={item} className="flex gap-3 font-medium"><CheckCircle2 className="shrink-0 text-[#398ee4]" />{item}</li>)}</ul></article><article className="rounded-[2rem] bg-[#073273] p-8 text-white"><h2 className="text-2xl font-bold">{text.extraTitle}</h2><ul className="mt-6 grid gap-4">{text.extras.map((item) => <li key={item} className="flex gap-3 font-medium text-white/85"><ChevronRight className="shrink-0 text-[#8dcbff]" />{item}</li>)}</ul></article></div></section>

    <section className="bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1050px]"><h2 className="text-center text-3xl font-bold sm:text-4xl">{text.flowTitle}</h2><ol className="mt-12 grid gap-5 md:grid-cols-3">{text.flow.map(([title, description], index) => { const Icon = flowIcons[index]; return <li key={title} className="rounded-3xl border border-[#d9e9f8] p-7"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-[#e7f3ff] text-[#1766ba]"><Icon size={26} /></span><p className="mt-5 text-xs font-bold text-[#67aef0]">STEP 0{index + 1}</p><h3 className="mt-1 text-xl font-bold">{title}</h3><p className="mt-3 font-medium leading-7 text-[#506783]">{description}</p></li>; })}</ol></div></section>

    <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 lg:px-12">{consultationForm}</section>
    <footer className="bg-[#073273] px-5 py-10 text-white"><div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-5 text-sm text-white/80">{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link href={contactHref}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap justify-center gap-5 text-sm text-white/65"><strong>{text.footerServices}</strong><a href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} tone="light" /><p className="mt-7 text-sm text-white/75">{copyrightText}</p></div></footer>
  </main>;
}
