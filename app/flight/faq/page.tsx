import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  ChevronRight,
  CircleDollarSign,
  CircleHelp,
  FileCheck2,
  Mail,
  PawPrint,
  Plane,
} from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "よくある質問 | PawsFlight Japan",
  description: "国際・国内ペット輸送、動物検疫、必要書類、料金についてのよくある質問をご案内します。",
  icons: { icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }] },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム", breadcrumb: "よくある質問", eyebrow: "Frequently Asked Questions", title: "よくあるご質問", lead: "国際・国内ペット輸送の準備、検疫、輸送方法、料金についてお答えします。",
    note: "渡航条件は国・地域・航空会社・時期によって変わります。個別の旅程については、最新条件を確認してご案内します。",
    categories: [
      ["準備・スケジュール", [["何か月前から準備すればよいですか？", "渡航先によって必要な期間が異なります。予定が決まり次第、できるだけ早めにご相談ください。"], ["相談時に必要な情報は何ですか？", "出発国・到着国、予定日、利用空港、ペットの種類・犬種・頭数・体重、現在のワクチン状況をお知らせください。"], ["渡航日がまだ決まっていなくても相談できますか？", "はい。おおよその時期と渡航先が分かれば、準備期間や先に確認すべき項目をご案内できます。"]]],
      ["検疫・必要書類", [["検疫手続きもお願いできますか？", "必要条件の確認や書類準備をサポートします。対応範囲は出発国・到着国と現在の準備状況によって異なります。"], ["マイクロチップやワクチンは必要ですか？", "必要条件は渡航先とペットの種類によって異なります。装着・接種の順番や有効期間も含めて確認します。"], ["海外から日本へ入国する際の事前届出は必要ですか？", "日本の輸入検疫では事前届出が必要です。出発国や到着空港を確認し、提出時期と必要情報をご案内します。"]]],
      ["輸送・クレート", [["犬・猫以外も対応できますか？", "動物の種類、渡航先、航空会社の条件を確認したうえでご案内します。"], ["輸送用クレートは用意してもらえますか？", "ペットのサイズと航空会社の条件に合うクレートについてご相談いただけます。"], ["飼い主が同じ便に乗らなくても輸送できますか？", "条件により貨物輸送やハンドキャリーをご案内できます。路線、航空会社、受取人を確認して方法を検討します。"]]],
      ["料金・変更", [["費用はいくらですか？", "渡航先、ペットの種類や大きさ、輸送方法、検疫・書類サポートの範囲によって異なるため、内容確認後に概算をご案内します。"], ["見積もり以外に費用が発生することはありますか？", "検査・証明書、保管、旅程変更、航空会社や現地事業者の追加費用が生じる場合があります。事前に分かる項目はお見積もりでご説明します。"], ["予定変更やキャンセルはできますか？", "可能ですが、手配の進行状況によって変更・キャンセル費用が発生する場合があります。分かり次第お早めにご連絡ください。"]]],
    ],
    inquiry: "無料相談・お見積もり", footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"], footerServices: "その他サービス", footerServiceLinks: ["ペットタクシー", "空港シャトル"], footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home", breadcrumb: "FAQ", eyebrow: "Frequently Asked Questions", title: "Frequently Asked Questions", lead: "Answers about preparation, quarantine, transport methods, and pricing for domestic and international pet travel.",
    note: "Requirements change by country, region, airline, and travel date. We check the latest conditions for each itinerary.",
    categories: [
      ["Preparation and timing", [["How early should I start preparing?", "The required timeline depends on the destination. Contact us as soon as your plans begin to take shape."], ["What information should I provide?", "Share the origin, destination, expected date, airports, animal, breed, number of pets, weight, and current vaccination status."], ["Can I ask before my travel date is confirmed?", "Yes. If you know the destination and approximate timing, we can outline preparation time and early checks."]]],
      ["Quarantine and documents", [["Can you help with quarantine procedures?", "We support requirement checks and document preparation. The available scope depends on the countries and current preparation."], ["Are microchips and vaccinations required?", "Requirements vary by destination and animal. We check timing, order, and validity as part of preparation."], ["Is advance notification required when entering Japan?", "Japan requires advance import notification. We explain the timing and information after confirming origin and arrival airport."]]],
      ["Transport and crates", [["Can you transport animals other than dogs and cats?", "We review the animal, destination, and airline requirements before advising you."], ["Can you provide a travel crate?", "We can advise on a crate suited to your pet's size and airline requirements."], ["Can my pet travel without me on the same flight?", "Cargo or hand-carry options may be available. We review the route, airline, and recipient before recommending a method."]]],
      ["Pricing and changes", [["How much does transport cost?", "Pricing depends on destination, pet, transport method, and support scope. We provide an estimate after reviewing the details."], ["Can costs arise beyond the estimate?", "Testing, certificates, storage, itinerary changes, airlines, or destination partners may add costs. Known items are explained in the estimate."], ["Can I change or cancel my plans?", "Yes, but fees may apply depending on how far arrangements have progressed. Contact us as soon as possible."]]],
    ],
    inquiry: "Free consultation & estimate", footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"], footerServices: "Other services", footerServiceLinks: ["Pet Taxi", "Airport Shuttle"], footerContact: "Contact us",
  },
} as const;

const categoryIcons = [CalendarClock, FileCheck2, Plane, CircleDollarSign] as const;

export default async function FaqPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, appConfig] = await Promise.all([searchParams, identityDispatcher({ action: "get_app_config" }).catch(() => null)]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const contactHref = `/flight/contact?lang=${language}`;
  const copyrightText = getCopyright(appConfig?.copyright ?? defaultCopyright, appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." }, language, "flight");
  const consultationForm = await DirectionPage({ params: Promise.resolve({ direction: "outbound" }), searchParams: Promise.resolve({ lang: language, standalone: "1", embed: "1" }) });
  const menuItems = text.nav.map((label, index) => ({ label, href: index === 5 ? `/flight/company?lang=${language}` : index === 1 ? `/flight/guide?lang=${language}` : index === 2 ? `/flight/pricing?lang=${language}` : index === 3 ? `/flight/stories?lang=${language}` : index === 4 ? `/flight/faq?lang=${language}` : `/flight?lang=${language}#services` }));

  return <main className="min-h-dvh bg-[#f6f9fc] text-[#073273]" style={{ fontFamily: "var(--font-zen-maru-gothic)" }}>
    <header className="border-b border-[#d9e9f8] bg-white/95"><div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12"><Link href={`/flight?lang=${language}`}><Image className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority /></Link><nav className="hidden items-center gap-7 font-bold xl:flex">{menuItems.map((item, index) => <Link key={item.label} className={index === 4 ? "text-[#398ee4]" : "hover:text-[#398ee4]"} href={item.href} aria-current={index === 4 ? "page" : undefined}>{item.label}</Link>)}</nav><div className="flex items-center gap-2"><nav className="flex rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold"><Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "ja" ? "bg-[#073273] text-white" : ""}`} href="/flight/faq?lang=ja">JA</Link><Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "en" ? "bg-[#073273] text-white" : ""}`} href="/flight/faq?lang=en">EN</Link></nav><Link href={contactHref} className="hidden min-h-12 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white lg:flex"><Mail size={17} />{text.inquiry}</Link><FlightMenu language={language} items={menuItems} contactLabel={text.inquiry} contactHref={contactHref} /></div></div></header>
    <section className="bg-[linear-gradient(135deg,#edf6ff_0%,#fff_58%,#e4f2ff_100%)] px-5 py-12 sm:px-8 lg:px-12 lg:py-20"><div className="mx-auto max-w-[1240px]"><nav className="flex items-center gap-2 text-sm font-bold text-[#506783]"><Link href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} /><span>{text.breadcrumb}</span></nav><div className="mt-12 grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]"><div><p className="text-xl font-bold tracking-[.14em] text-[#398ee4]">{text.eyebrow}</p><h1 className="mt-5 text-4xl font-bold sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 text-lg font-medium leading-8 text-[#506783]">{text.lead}</p></div><div className="rounded-[2rem] bg-white p-8 shadow-[0_20px_60px_rgba(7,50,115,.1)]"><div className="flex items-center gap-4"><span className="grid h-16 w-16 place-items-center rounded-2xl bg-[#073273] text-white"><CircleHelp size={33} /></span><div><p className="font-bold text-[#398ee4]">FAQ</p><p className="mt-1 text-xl font-bold">Answers for Your Journey</p></div></div><p className="mt-6 flex gap-3 font-bold leading-7 text-[#506783]"><PawPrint className="shrink-0 text-[#398ee4]" />{text.note}</p></div></div></div></section>

    <section className="bg-white px-5 py-16 sm:px-8 lg:px-12 lg:py-24"><div className="mx-auto grid max-w-[1100px] gap-8">{text.categories.map(([category, questions], categoryIndex) => { const Icon = categoryIcons[categoryIndex]; return <section key={category} className="overflow-hidden rounded-[2rem] border border-[#d9e9f8] bg-white shadow-[0_14px_40px_rgba(7,50,115,.06)]"><header className="flex items-center gap-4 bg-[#edf6ff] p-6 sm:p-8"><span className="grid h-13 w-13 place-items-center rounded-2xl bg-white text-[#1766ba]"><Icon size={27} /></span><h2 className="text-2xl font-bold">{category}</h2></header><div className="divide-y divide-[#d9e9f8] px-6 sm:px-8">{questions.map(([question, answer]) => <details key={question} className="group"><summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold [&::-webkit-details-marker]:hidden"><span className="flex gap-3"><span className="text-[#398ee4]">Q.</span>{question}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eaf5ff] text-[#1766ba] transition-transform group-open:rotate-45">＋</span></summary><p className="pb-6 pl-8 pr-8 font-medium leading-7 text-[#506783]"><strong className="mr-2 text-[#398ee4]">A.</strong>{answer}</p></details>)}</div></section>; })}</div></section>

    <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 lg:px-12">{consultationForm}</section>
    <footer className="bg-[#073273] px-5 py-10 text-white"><div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-5 text-sm text-white/80">{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link href={contactHref}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap justify-center gap-5 text-sm text-white/65"><strong>{text.footerServices}</strong><a href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} tone="light" /><p className="mt-7 text-sm text-white/75">{copyrightText}</p></div></footer>
  </main>;
}
