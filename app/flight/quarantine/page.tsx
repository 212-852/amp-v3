import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileCheck2,
  Mail,
  MapPinCheck,
  PawPrint,
  PlaneTakeoff,
  ShieldCheck,
  Syringe,
} from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";

export const metadata: Metadata = {
  title: "動物検疫・書類サポート | PawsFlight Japan",
  description:
    "ペットの海外渡航に必要な動物検疫、ワクチン、検査、証明書、事前届出などの準備をPawsFlight Japanがサポートします。",
  icons: {
    icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }],
  },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム",
    breadcrumb: "動物検疫・書類サポート",
    eyebrow: "Quarantine & Documentation",
    title: "動物検疫・書類サポート",
    lead: "国や地域で異なる渡航条件を整理し、必要書類・ワクチン・検査・検疫手続きの準備をサポートします。",
    note: "渡航条件は、出発国・到着国・ペットの種類・渡航方法によって異なります。内容を確認したうえで、必要な準備をご案内します。",
    exportTitle: "輸出検疫サポート",
    exportDirection: "日本から海外へ",
    exportLead: "日本から海外へペットを渡航させる際に必要となる検疫準備・書類・スケジュールを整理します。",
    exportItems: [
      ["渡航条件の確認", "渡航先の国・地域、航空会社、輸送方法に応じた条件を確認します。"],
      ["ワクチン・検査", "マイクロチップ、ワクチン、血液検査など必要な準備をご案内します。"],
      ["必要書類・証明書", "申請書、健康証明書、輸出国側で必要となる証明書などを確認します。"],
      ["出国までのスケジュール", "検査や申請に必要な期間を踏まえ、渡航日から逆算して準備を整理します。"],
      ["日本出国時の検疫", "動物検疫所で必要となる手続きや当日の流れをご案内します。"],
      ["輸送サービスとの連携", "ハンドキャリー、航空貨物、国内空港輸送と組み合わせてご相談いただけます。"],
    ],
    importTitle: "輸入検疫サポート",
    importDirection: "海外から日本へ",
    importLead: "海外から日本へペットを連れてくる際に必要となる、日本の輸入検疫準備をサポートします。",
    importItems: [
      ["日本の輸入条件", "出発国・地域とペットの種類に応じて、日本への輸入条件を確認します。"],
      ["マイクロチップ・狂犬病予防", "装着時期、予防接種、抗体価検査、待機期間などを確認します。"],
      ["海外で準備する証明書", "海外の動物病院や輸出国政府機関で取得する書類をご案内します。"],
      ["動物検疫所への事前届出", "日本到着前に必要な届出と提出時期を整理します。"],
      ["日本到着時の検疫", "到着空港での検疫、書類確認、ペットの受け取りまでをご案内します。"],
      ["到着後の国内輸送", "検疫後の空港受取や、日本国内の指定場所までの輸送もご相談いただけます。"],
    ],
    prepareEyebrow: "Before You Contact Us",
    prepareTitle: "ご相談前に分かるとスムーズなこと",
    prepareItems: [
      "出発国・到着国",
      "渡航予定日",
      "ペットの種類・犬種や猫種・頭数",
      "マイクロチップとワクチンの履歴",
      "希望する輸送方法・サポート範囲",
    ],
    ctaTitle: "動物検疫や必要書類について、まずはご相談ください。",
    ctaLead: "現在の準備状況を伺い、渡航までに必要な手続きとスケジュールをご案内します。",
    ctaAction: "無料相談・概算見積もり",
    menu: "メニュー",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home",
    breadcrumb: "Quarantine & document support",
    eyebrow: "Quarantine & Documentation",
    title: "Quarantine & Document Support",
    lead: "We help organize the documents, vaccinations, tests, and quarantine procedures required for your pet's international journey.",
    note: "Requirements vary by origin, destination, animal, and transport method. We review your itinerary before outlining the preparation you need.",
    exportTitle: "Export quarantine support",
    exportDirection: "Japan to overseas",
    exportLead: "We organize the quarantine preparation, documentation, and timeline required when traveling with a pet from Japan.",
    exportItems: [
      ["Travel requirements", "We review destination, airline, and transport-method requirements."],
      ["Vaccinations and tests", "We guide you through microchip, vaccination, and laboratory requirements."],
      ["Documents and certificates", "We check application forms, health certificates, and required official documents."],
      ["Preparation timeline", "We work backward from your travel date to organize tests, applications, and deadlines."],
      ["Export quarantine", "We explain the Animal Quarantine Service procedures required when leaving Japan."],
      ["Transport coordination", "Support can be combined with hand carry, air cargo, and domestic airport transport."],
    ],
    importTitle: "Import quarantine support",
    importDirection: "Overseas to Japan",
    importLead: "We support the preparation required to bring a pet from overseas into Japan.",
    importItems: [
      ["Japan import requirements", "We review Japan's requirements based on the country of departure and your pet."],
      ["Microchip and rabies preparation", "We check implantation, vaccination, antibody testing, and waiting periods."],
      ["Overseas certificates", "We guide you on documents issued by veterinarians and the exporting authority."],
      ["Advance notification", "We organize the notification required before arrival at Japan's Animal Quarantine Service."],
      ["Arrival quarantine", "We explain inspection, document review, and pet collection at the arrival airport."],
      ["Domestic transport after arrival", "Airport collection and onward transport within Japan can also be arranged."],
    ],
    prepareEyebrow: "Before You Contact Us",
    prepareTitle: "Information that helps us guide you",
    prepareItems: [
      "Country of departure and destination",
      "Expected travel date",
      "Animal, breed, and number of pets",
      "Microchip and vaccination history",
      "Preferred transport and support scope",
    ],
    ctaTitle: "Talk to us about quarantine and travel documents.",
    ctaLead: "We will review your current preparation and outline the procedures and timeline needed for travel.",
    ctaAction: "Free consultation & estimate",
    menu: "Menu",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
  },
} as const;

export default async function FlightQuarantinePage({
  searchParams,
}: {
  searchParams: Promise<{ lang?: string | string[] }>;
}) {
  const [query, appConfig] = await Promise.all([
    searchParams,
    identityDispatcher({ action: "get_app_config" }).catch(() => null),
  ]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const companyName = appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." };
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    companyName,
    language,
    "flight",
  );
  const consultationForm = await DirectionPage({
    params: Promise.resolve({ direction: "outbound" }),
    searchParams: Promise.resolve({
      lang: language,
      standalone: "1",
      embed: "1",
    }),
  });
  const mobileMenuItems = text.nav.map((label, index) => ({
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
  const detailGroups = [
    {
      title: text.exportTitle,
      direction: text.exportDirection,
      lead: text.exportLead,
      icon: PlaneTakeoff,
      items: text.exportItems,
      accent: "bg-[#eaf5ff] text-[#1766ba]",
    },
    {
      title: text.importTitle,
      direction: text.importDirection,
      lead: text.importLead,
      icon: ShieldCheck,
      items: text.importItems,
      accent: "bg-[#073273] text-white",
    },
  ];
  const itemIcons = [MapPinCheck, Syringe, FileCheck2, CalendarClock, ClipboardCheck, CheckCircle2];

  return (
    <main className="min-h-dvh bg-[#f6f9fc] text-[#073273]" style={{ fontFamily: "var(--font-zen-maru-gothic)" }}>
      <header className="border-b border-[#d9e9f8] bg-white/95">
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link href={`/flight?lang=${language}`} aria-label="PawsFlight Japan home">
            <Image className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority />
          </Link>
          <nav className="hidden items-center gap-7 text-base font-bold xl:flex" aria-label={language === "ja" ? "メインナビゲーション" : "Main navigation"}>
            {mobileMenuItems.map((item, index) => <Link key={item.label} className={`whitespace-nowrap transition-colors hover:text-[#398ee4] ${index === 0 ? "text-[#398ee4]" : ""}`} href={item.href}>{item.label}</Link>)}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold shadow-sm" aria-label="Language">
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/quarantine?lang=ja" lang="ja" aria-current={language === "ja" ? "page" : undefined}>JA</Link>
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/quarantine?lang=en" lang="en" aria-current={language === "en" ? "page" : undefined}>EN</Link>
            </nav>
            <Link href={`/flight/contact?lang=${language}&service=quarantine`} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)] lg:flex"><Mail size={17} aria-hidden="true" />{text.ctaAction}</Link>
            <FlightMenu language={language} items={mobileMenuItems} contactLabel={text.ctaAction} contactHref={`/flight/contact?lang=${language}&service=quarantine`} />
          </div>
        </div>
      </header>

      <section className="bg-[linear-gradient(180deg,#edf6ff_0%,#f8fbff_100%)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1240px]">
          <nav className="flex items-center gap-2 text-sm font-bold text-[#506783]" aria-label={language === "ja" ? "パンくずリスト" : "Breadcrumb"}>
            <Link className="hover:text-[#1766ba]" href={`/flight?lang=${language}`}>{text.home}</Link>
            <ChevronRight size={16} aria-hidden="true" />
            <span aria-current="page" className="text-[#073273]">{text.breadcrumb}</span>
          </nav>
          <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.eyebrow}</p><h1 className="mt-5 text-4xl font-bold leading-[1.35] sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 max-w-[760px] text-base font-medium leading-8 text-[#506783] sm:text-lg">{text.lead}</p></div>
            <div className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(7,50,115,0.1)]"><div className="flex items-center gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#073273] text-white"><FileCheck2 size={32} aria-hidden="true" /></span><div><p className="font-bold text-[#398ee4]">QUARANTINE SUPPORT</p><p className="mt-1 text-xl font-bold">Export ↔ Import</p></div></div><p className="mt-6 flex gap-3 text-sm font-bold leading-7 text-[#506783] sm:text-base"><PawPrint className="mt-1 shrink-0 text-[#398ee4]" size={22} aria-hidden="true" />{language === "ja" ? "検疫条件、ワクチン・検査、必要書類、事前届出を渡航予定に合わせて整理します。" : "We organize quarantine rules, vaccinations, tests, documents, and advance notifications around your travel date."}</p></div>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-8 lg:grid-cols-2">
          {detailGroups.map((group) => {
            const GroupIcon = group.icon;
            return <article key={group.title} className="overflow-hidden rounded-[2rem] border border-[#d9e9f8] bg-white shadow-[0_18px_55px_rgba(7,50,115,0.08)]">
              <div className={`${group.accent} p-7 sm:p-9`}><div className="flex items-center gap-4"><span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/90 text-[#1766ba]"><GroupIcon size={29} aria-hidden="true" /></span><div><p className="text-sm font-bold tracking-[0.12em] opacity-75">{group.direction}</p><h2 className="mt-1 text-2xl font-bold sm:text-3xl">{group.title}</h2></div></div><p className="mt-5 font-medium leading-7 opacity-85">{group.lead}</p></div>
              <ul className="divide-y divide-[#d9e9f8] px-6 sm:px-8">
                {group.items.map(([title, description], index) => {
                  const ItemIcon = itemIcons[index];
                  return <li key={title} className="flex gap-4 py-6"><span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#edf6ff] text-[#398ee4]"><ItemIcon size={22} aria-hidden="true" /></span><div><h3 className="text-lg font-bold">{title}</h3><p className="mt-2 text-sm font-medium leading-7 text-[#506783] sm:text-base">{description}</p></div></li>;
                })}
              </ul>
            </article>;
          })}
          <p className="flex items-start gap-3 rounded-2xl bg-[#edf6ff] p-5 text-sm font-bold leading-7 text-[#355477] sm:text-base lg:col-span-2">
            <PawPrint className="mt-0.5 shrink-0 text-[#398ee4]" size={23} aria-hidden="true" />
            {text.note}
          </p>
        </div>
      </section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1050px]">
          <div className="text-center"><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{text.prepareEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{text.prepareTitle}</h2></div>
          <ul className="mt-10 grid gap-4 sm:grid-cols-2">
            {text.prepareItems.map((item, index) => <li key={item} className={`flex items-center gap-4 rounded-2xl border border-[#c7ddf1] bg-white p-5 font-bold shadow-[0_10px_30px_rgba(7,50,115,0.05)] ${index === text.prepareItems.length - 1 ? "sm:col-span-2" : ""}`}><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[#073273] text-sm text-white">{String(index + 1).padStart(2, "0")}</span>{item}</li>)}
          </ul>
        </div>
      </section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        {consultationForm}
      </section>

      <footer className="bg-[#073273] px-5 py-10 text-white sm:px-8 sm:py-12">
        <div className="mx-auto max-w-[1240px] text-center">
          <nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-white/80 sm:text-sm" aria-label={language === "ja" ? "サイトマップ" : "Sitemap"}>{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} className="hover:text-white" href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link className="hover:text-white" href={`/flight/contact?lang=${language}&service=quarantine`}>{text.footerContact}</Link></nav>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/65 sm:text-sm"><span className="font-bold text-white/80">{text.footerServices}</span><a className="hover:text-white" href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a className="hover:text-white" href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div>
          <FlightSocial language={language} />
          <p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">{copyrightText}</p>
        </div>
      </footer>
    </main>
  );
}
