import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarCheck2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  Handshake,
  Mail,
  MapPinCheck,
  MessageCircleMore,
  PawPrint,
  Plane,
  ShieldCheck,
} from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "ご利用の流れ | PawsFlight Japan",
  description: "ご相談から渡航準備、輸送、お引き渡しまでの流れをご案内します。",
  icons: { icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }] },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"], home: "ホーム", breadcrumb: "ご利用の流れ",
    eyebrow: "How It Works", title: "国際ペット輸送の\nご利用案内", lead: "最初のご相談から渡航準備、航空輸送、到着後のお引き渡しまで、必要な手順を分かりやすくご案内します。",
    note: "渡航条件と準備期間は、出発国・到着国・ペット・航空会社によって異なります。予定が決まり次第、早めにご相談ください。",
    stepsEyebrow: "Step by Step", stepsTitle: "ご相談からお引き渡しまで",
    steps: [["お問い合わせ", "出発地・到着地、渡航予定日、ペットの種類や頭数など、分かる範囲でお知らせください。"], ["条件確認・概算見積もり", "検疫条件、航空会社、輸送方法、必要なサポート範囲を確認します。"], ["渡航スケジュールの作成", "ワクチン、検査、届出、証明書を渡航日から逆算して整理します。"], ["書類・クレートの準備", "必要書類と航空会社の条件に合う輸送用クレートを確認します。"], ["国内輸送・空港受付", "ご自宅から空港への輸送と、空港での受付・引き渡しを調整します。"], ["航空輸送", "貨物、受託手荷物、ハンドキャリーなど確認済みの方法で輸送します。"], ["到着・検疫", "到着空港で必要な検疫と書類確認を行い、受け取り手続きを進めます。"], ["お引き渡し", "到着空港または調整した場所でお引き渡しします。"]],
    directionEyebrow: "Choose Your Journey", directionTitle: "渡航方向に合わせた詳しいご案内",
    outbound: ["日本から海外へ", "渡航先の検疫条件、日本の輸出検疫、出発空港までの輸送を確認します。"], inbound: ["海外から日本へ", "日本の輸入条件、事前届出、到着時の検疫と国内輸送を確認します。"], action: "詳しく見る",
    prepareTitle: "最初のご相談で分かるとスムーズなこと", prepare: ["出発国・到着国", "渡航予定日", "利用予定の空港・航空会社", "ペットの種類・犬種や猫種・頭数・体重", "マイクロチップ・ワクチン・検査の履歴", "希望する輸送方法とサポート範囲"],
    inquiry: "無料相談・お見積もり", footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"], footerServices: "その他サービス", footerServiceLinks: ["ペットタクシー", "空港シャトル"], footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"], home: "Home", breadcrumb: "How It Works",
    eyebrow: "How It Works", title: "Your Guide to\nInternational Pet Transport", lead: "A clear guide from your first consultation through preparation, air transport, arrival, and handover.",
    note: "Requirements and preparation time vary by origin, destination, pet, and airline. Contact us as soon as your plans begin to take shape.",
    stepsEyebrow: "Step by Step", stepsTitle: "From consultation to handover",
    steps: [["Initial inquiry", "Share your origin, destination, expected date, and pet details to the extent known."], ["Requirement review and estimate", "We review quarantine, airlines, transport methods, and support scope."], ["Travel timeline", "Vaccinations, tests, notifications, and certificates are organized from the travel date."], ["Documents and crate", "We review the paperwork and an airline-compliant travel crate."], ["Ground transport and acceptance", "Home-to-airport transport and airport handover are coordinated around the itinerary."], ["Air transport", "Your pet travels using the confirmed cargo, checked-baggage, or hand-carry arrangement."], ["Arrival and quarantine", "Required arrival inspection and document checks are completed before collection."], ["Handover", "Your pet is handed over at the airport or agreed location."]],
    directionEyebrow: "Choose Your Journey", directionTitle: "Guidance for your direction of travel",
    outbound: ["From Japan", "Review destination quarantine, Japan export procedures, and transport to the departure airport."], inbound: ["To Japan", "Review Japan import requirements, advance notification, arrival quarantine, and onward transport."], action: "View details",
    prepareTitle: "Information that helps at your first consultation", prepare: ["Country of origin and destination", "Expected travel date", "Expected airports and airline", "Animal, breed, number of pets, and weight", "Microchip, vaccination, and testing history", "Preferred transport method and support scope"],
    inquiry: "Free consultation & estimate", footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"], footerServices: "Other services", footerServiceLinks: ["Pet Taxi", "Airport Shuttle"], footerContact: "Contact us",
  },
} as const;

const stepIcons = [MessageCircleMore, ClipboardCheck, CalendarCheck2, FileCheck2, MapPinCheck, Plane, ShieldCheck, Handshake] as const;

export default async function GuidePage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, appConfig] = await Promise.all([searchParams, identityDispatcher({ action: "get_app_config" }).catch(() => null)]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const contactHref = `/flight/contact?lang=${language}`;
  const copyrightText = getCopyright(appConfig?.copyright ?? defaultCopyright, appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." }, language, "flight");
  const consultationForm = await DirectionPage({ params: Promise.resolve({ direction: "outbound" }), searchParams: Promise.resolve({ lang: language, standalone: "1", embed: "1" }) });
  const menuItems = text.nav.map((label, index) => ({ label, href: index === 5 ? `/flight/company?lang=${language}` : index === 1 ? `/flight/guide?lang=${language}` : index === 2 ? `/flight/pricing?lang=${language}` : index === 3 ? `/flight/stories?lang=${language}` : index === 4 ? `/flight/faq?lang=${language}` : `/flight?lang=${language}#${index === 0 ? "services" : "top"}` }));

  return <main className="min-h-dvh bg-[#f6f9fc] text-[#073273]" style={{ fontFamily: "var(--font-zen-maru-gothic)" }}>
    <header className="border-b border-[#d9e9f8] bg-white/95"><div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12"><Link href={`/flight?lang=${language}`} aria-label="PawsFlight Japan home"><Image className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority /></Link><nav className="hidden items-center gap-7 text-base font-bold xl:flex">{menuItems.map((item, index) => <Link key={item.label} className={index === 1 ? "text-[#398ee4]" : "hover:text-[#398ee4]"} href={item.href} aria-current={index === 1 ? "page" : undefined}>{item.label}</Link>)}</nav><div className="flex items-center gap-2"><nav className="flex rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold"><Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "ja" ? "bg-[#073273] text-white" : ""}`} href="/flight/guide?lang=ja">JA</Link><Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "en" ? "bg-[#073273] text-white" : ""}`} href="/flight/guide?lang=en">EN</Link></nav><Link href={contactHref} className="hidden min-h-12 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white lg:flex"><Mail size={17} />{text.inquiry}</Link><FlightMenu language={language} items={menuItems} contactLabel={text.inquiry} contactHref={contactHref} /></div></div></header>
    <section className="bg-[linear-gradient(135deg,#edf6ff_0%,#fff_58%,#e4f2ff_100%)] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="mx-auto max-w-[1240px]"><nav className="flex items-center gap-2 text-sm font-bold text-[#506783]"><Link href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} /><span>{text.breadcrumb}</span></nav><div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"><div><p className="text-xl font-bold tracking-[.14em] text-[#398ee4]">{text.eyebrow}</p><h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.3] sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 text-lg font-medium leading-8 text-[#506783]">{text.lead}</p></div><div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(7,50,115,.1)]"><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#073273] text-white"><ClipboardCheck size={32} /></span><div><p className="font-bold text-[#398ee4]">HOW IT WORKS</p><p className="mt-1 text-xl font-bold">Consultation → Handover</p></div></div><p className="mt-6 flex gap-3 font-bold leading-7 text-[#506783]"><PawPrint className="shrink-0 text-[#398ee4]" />{text.note}</p></div></div></div></section>
    <section className="bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1240px]"><div className="text-center"><p className="text-xl font-bold tracking-[.14em] text-[#398ee4]">{text.stepsEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.stepsTitle}</h2></div><ol className="mt-12 grid gap-5 md:grid-cols-2">{text.steps.map(([title, description], index) => { const Icon = stepIcons[index]; return <li key={title} className="flex gap-5 rounded-3xl border border-[#d9e9f8] bg-[#f9fcff] p-6"><span className="grid h-13 w-13 shrink-0 place-items-center rounded-2xl bg-[#e7f3ff] text-[#1766ba]"><Icon size={26} /></span><div><p className="text-xs font-bold text-[#67aef0]">STEP {String(index + 1).padStart(2, "0")}</p><h3 className="mt-1 text-xl font-bold">{title}</h3><p className="mt-3 font-medium leading-7 text-[#506783]">{description}</p></div></li>; })}</ol></div></section>
    <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto max-w-[1100px]"><div className="text-center"><p className="text-xl font-bold tracking-[.14em] text-[#398ee4]">{text.directionEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.directionTitle}</h2></div><div className="mt-12 grid gap-6 md:grid-cols-2">{([['outbound', text.outbound], ['inbound', text.inbound]] as const).map(([id, item]) => <article key={id} className="rounded-[2rem] bg-white p-8"><Plane className="text-[#398ee4]" size={34} /><h3 className="mt-5 text-2xl font-bold">{item[0]}</h3><p className="mt-4 font-medium leading-8 text-[#506783]">{item[1]}</p><Link className="mt-6 inline-flex items-center gap-2 font-bold text-[#1766ba]" href={`/flight/${id}?lang=${language}`}>{text.action}<ChevronRight size={18} /></Link></article>)}</div><div className="mt-8 rounded-[2rem] bg-[#073273] p-8 text-white"><h3 className="text-2xl font-bold">{text.prepareTitle}</h3><ul className="mt-6 grid gap-4 sm:grid-cols-2">{text.prepare.map((item) => <li key={item} className="flex gap-3"><CheckCircle2 className="shrink-0 text-[#8dcbff]" />{item}</li>)}</ul></div></div></section>
    <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 lg:px-12">{consultationForm}</section>
    <footer className="bg-[#073273] px-5 py-10 text-white"><div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-5 text-sm text-white/80">{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link href={contactHref}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap justify-center gap-5 text-sm text-white/65"><strong>{text.footerServices}</strong><a href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} tone="light" /><p className="mt-7 text-sm text-white/75">{copyrightText}</p></div></footer>
  </main>;
}
