import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChevronRight,
  Mail,
  MapPin,
  Menu,
  PawPrint,
  Phone,
  UserRound,
  BriefcaseBusiness,
} from "lucide-react";

import { defaultCopyright, getCopyright } from "@/lib/content";
import { getTranslation } from "@/lib/i18n";
import { identityDispatcher } from "@/lib/identity";
import { FlightSocial } from "@/components/toast";

export const metadata: Metadata = {
  title: "会社概要 | PawsFlight Japan",
  description: "PawsFlight Japanを運営する会社の概要です。",
  icons: {
    icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }],
  },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム",
    title: "会社概要",
    eyebrow: "Company Profile",
    introduction: "PawsFlight Japanを運営する会社の基本情報です。",
    companyName: "会社名",
    address: "所在地",
    representative: "代表者",
    business: "事業内容",
    contact: "連絡先",
    inquiryTitle: "ペットの国内外の移動について、\nまずはご相談ください。",
    inquiryLead: "渡航先・ペットの種類・予定日などを確認し、必要な準備をご案内します。",
    inquiryAction: "無料相談・概算見積もり",
    menu: "メニュー",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home",
    title: "Company Profile",
    eyebrow: "Company Profile",
    introduction: "Basic information about the company operating PawsFlight Japan.",
    companyName: "Company name",
    address: "Address",
    representative: "Representative",
    business: "Business activities",
    contact: "Contact",
    inquiryTitle: "Planning a domestic or international move with your pet?",
    inquiryLead: "Tell us your destination, pet, and expected travel date, and we will guide you through the preparation you need.",
    inquiryAction: "Free consultation & estimate",
    menu: "Menu",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
  },
} as const;

export default async function FlightCompanyPage({
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
  const company = appConfig?.company ?? {
    name: { ja: "Wan Da Nya Inc.", en: "Wan Da Nya Inc." },
    representative: { ja: "", en: "" },
    business: { ja: "", en: "" },
    contact: { phone: "", email: "" },
    address: { prefectureCode: "", cityCode: "", detail: { ja: "", en: "" } },
    legal: {
      seller: { ja: "", en: "" }, operationsManager: { ja: "", en: "" },
      price: { ja: "", en: "" }, additionalFees: { ja: "", en: "" },
      paymentMethods: { ja: "", en: "" }, cancellationRefunds: { ja: "", en: "" },
    },
  };
  const placeLanguage = language === "ja" ? "ja" : "en";
  const [prefectures, cities] = await Promise.all([
    identityDispatcher({
      action: "list_places",
      placeType: "prefectures",
      language: placeLanguage,
    }).catch(() => []),
    company.address.prefectureCode
      ? identityDispatcher({
          action: "list_places",
          placeType: "cities",
          language: placeLanguage,
          prefectureCode: company.address.prefectureCode,
        }).catch(() => [])
      : Promise.resolve([]),
  ]);
  const prefecture = prefectures.find(
    (place) => place.code === company.address.prefectureCode,
  )?.name;
  const city = cities.find((place) => place.code === company.address.cityCode)?.name;
  const addressDetail = getTranslation(company.address.detail, language);
  const address = language === "ja"
    ? [prefecture, city, addressDetail].filter(Boolean).join(" ")
    : [addressDetail, city, prefecture].filter(Boolean).join(", ");
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    company.name,
    language,
    "flight",
  );

  return (
    <main
      className="min-h-dvh bg-[#f6f9fc] text-[#073273]"
      style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
    >
      <header className="border-b border-[#d9e9f8] bg-white/95">
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link href={`/flight?lang=${language}`} aria-label="PawsFlight Japan home">
            <Image
              className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]"
              src="/images/flight/logo.svg"
              alt="PawsFlight Japan"
              width={1200}
              height={300}
              priority
            />
          </Link>

          <nav className="hidden items-center gap-7 text-sm font-bold xl:flex" aria-label="メインナビゲーション">
            {text.nav.map((item, index) => (
              <Link
                key={item}
                className={`whitespace-nowrap transition-colors hover:text-[#398ee4] ${index === text.nav.length - 1 ? "text-[#398ee4]" : ""}`}
                href={index === text.nav.length - 1
                  ? `/flight/company?lang=${language}`
                  : index === 1
                    ? `/flight/guide?lang=${language}`
                    : index === 2
                      ? `/flight/pricing?lang=${language}`
                      : index === 3
                    ? `/flight/stories?lang=${language}`
                    : index === 4
                      ? `/flight/faq?lang=${language}`
                      : `/flight?lang=${language}#${index === 0 ? "services" : "top"}`}
              >
                {item}
              </Link>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold shadow-sm" aria-label="Language">
              <Link
                className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`}
                href="/flight/company?lang=ja"
                lang="ja"
                aria-current={language === "ja" ? "page" : undefined}
              >
                JA
              </Link>
              <Link
                className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`}
                href="/flight/company?lang=en"
                lang="en"
                aria-current={language === "en" ? "page" : undefined}
              >
                EN
              </Link>
            </nav>
            <Link href={`/flight/contact?lang=${language}`} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)] lg:flex"><Mail size={17} aria-hidden="true" />{text.inquiryAction}</Link>
            <button
              type="button"
              className="grid h-12 w-12 place-items-center rounded-full border border-[#b7d8f6] bg-white text-[#073273] shadow-sm xl:hidden"
              aria-label={text.menu}
            >
              <Menu size={24} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <section className="bg-[linear-gradient(180deg,#edf6ff_0%,#f7fbff_100%)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto max-w-[1240px]">
          <nav className="flex items-center gap-2 text-sm font-bold text-[#506783]" aria-label="Breadcrumb">
            <Link className="transition-colors hover:text-[#1766ba]" href={`/flight?lang=${language}`}>
              {text.home}
            </Link>
            <ChevronRight size={16} aria-hidden="true" />
            <span aria-current="page" className="text-[#073273]">{text.title}</span>
          </nav>

          <div className="mt-12 sm:mt-16">
            <p className="text-base font-bold tracking-[0.16em] text-[#398ee4] sm:text-lg">
              {text.eyebrow}
            </p>
            <h1 className="mt-4 flex items-center gap-3 text-4xl font-bold text-[#073273] sm:text-5xl">
              {text.title}
              <span className="flex items-center gap-1 text-[#398ee4]" aria-hidden="true">
                <Building2 size={36} />
                <PawPrint size={27} />
              </span>
            </h1>
            <p className="mt-5 text-base font-medium leading-8 text-[#506783] sm:text-lg">
              {text.introduction}
            </p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[960px] overflow-hidden rounded-[2rem] border border-[#d9e9f8] bg-white shadow-[0_18px_55px_rgba(7,50,115,0.08)]">
          <dl>
            <div className="grid gap-3 border-b border-[#d9e9f8] px-6 py-8 sm:grid-cols-[220px_1fr] sm:px-10">
              <dt className="flex items-center gap-3 font-bold text-[#506783]">
                <Building2 className="text-[#398ee4]" size={22} aria-hidden="true" />
                {text.companyName}
              </dt>
              <dd className="text-lg font-bold text-[#073273] sm:text-xl">
                {getTranslation(company.name, language) || "—"}
              </dd>
            </div>
            <div className="grid gap-3 border-b border-[#d9e9f8] px-6 py-8 sm:grid-cols-[220px_1fr] sm:px-10">
              <dt className="flex items-center gap-3 font-bold text-[#506783]">
                <MapPin className="text-[#398ee4]" size={22} aria-hidden="true" />
                {text.address}
              </dt>
              <dd className="text-lg font-bold leading-8 text-[#073273] sm:text-xl">
                {address || "—"}
              </dd>
            </div>
            <div className="grid gap-3 border-b border-[#d9e9f8] px-6 py-8 sm:grid-cols-[220px_1fr] sm:px-10">
              <dt className="flex items-center gap-3 font-bold text-[#506783]"><UserRound className="text-[#398ee4]" size={22} aria-hidden="true" />{text.representative}</dt>
              <dd className="text-lg font-bold leading-8 text-[#073273] sm:text-xl">{getTranslation(company.representative, language) || "—"}</dd>
            </div>
            <div className="grid gap-3 border-b border-[#d9e9f8] px-6 py-8 sm:grid-cols-[220px_1fr] sm:px-10">
              <dt className="flex items-center gap-3 font-bold text-[#506783]"><BriefcaseBusiness className="text-[#398ee4]" size={22} aria-hidden="true" />{text.business}</dt>
              <dd className="whitespace-pre-line text-lg font-bold leading-8 text-[#073273] sm:text-xl">{getTranslation(company.business, language) || "—"}</dd>
            </div>
            <div className="grid gap-3 px-6 py-8 sm:grid-cols-[220px_1fr] sm:px-10">
              <dt className="flex items-center gap-3 font-bold text-[#506783]"><Phone className="text-[#398ee4]" size={22} aria-hidden="true" />{text.contact}</dt>
              <dd className="text-lg font-bold leading-8 text-[#073273] sm:text-xl">{[company.contact.phone, company.contact.email].filter(Boolean).join(" / ") || "—"}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center rounded-[2rem] bg-[#073273] px-6 py-12 text-center text-white shadow-[0_20px_55px_rgba(7,50,115,0.2)] sm:px-12 sm:py-16">
          <PawPrint className="text-[#8dcbff]" size={34} aria-hidden="true" />
          <h2 className="mt-5 max-w-[850px] whitespace-pre-line text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            {text.inquiryTitle}
          </h2>
          <p className="mt-5 max-w-[760px] text-sm font-medium leading-7 text-white/75 sm:text-base">
            {text.inquiryLead}
          </p>
          <Link href={`/flight/contact?lang=${language}`} className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 font-bold text-[#073273]">
            <Mail size={18} aria-hidden="true" />
            {text.inquiryAction}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </section>

      <footer className="bg-[#073273] px-5 py-10 text-white sm:px-8 sm:py-12">
        <div className="mx-auto max-w-[1240px] text-center">
          <div>
            <nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-white/80 sm:text-sm" aria-label={language === "ja" ? "サイトマップ" : "Sitemap"}>
              {[
                `/flight/terms?lang=${language}`,
                `/flight/privacy?lang=${language}`,
                `/flight/cancellation?lang=${language}`,
                `/flight/legal?lang=${language}`,
              ].map((href, index) => (
                <Link key={href} className="transition-colors hover:text-white" href={href}>
                  {text.footerLegal[index]}
                </Link>
              ))}
              <Link className="transition-colors hover:text-white" href={`/flight/contact?lang=${language}&form=inquiry`}>
                {text.footerContact}
              </Link>
            </nav>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/65 sm:text-sm">
              <span className="font-bold text-white/80">{text.footerServices}</span>
              <a className="transition-colors hover:text-white" href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a>
              <a className="transition-colors hover:text-white" href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a>
            </div>
          </div>
          <FlightSocial language={language} />
          <p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">
            {copyrightText}
          </p>
        </div>
      </footer>
    </main>
  );
}
