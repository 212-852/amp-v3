import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Globe2, Mail, Menu } from "lucide-react";

import { defaultCopyright, getCopyright, type CountryRegion } from "@/lib/content";
import { getTranslation } from "@/lib/i18n";
import { identityDispatcher } from "@/lib/identity";
import DirectionPage from "../[direction]/page";
import { FlightSocial } from "@/components/toast";

export const metadata: Metadata = {
  title: "対応国・地域 | PawsFlight Japan",
  description: "PawsFlight Japanが対応している国と地域をご案内します。",
  icons: { icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }] },
};

const regions: CountryRegion[] = ["eastAsia", "southeastAsia", "northAmerica", "europe", "oceania", "other"];

const copy = {
  ja: {
    home: "ホーム",
    title: "対応国・地域",
    eyebrow: "Worldwide Support",
    lead: "掲載されていない国や地域についても、案件ごとに対応可否を確認します。",
    menu: "メニュー",
    consult: "要相談",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
    inquiryTitle: "大切な家族との国内外へのお引越し、まずはご相談ください。",
    inquiryLead: "渡航先・ペットの種類・渡航予定日などを確認し、必要な準備をご案内します。",
    inquiryAction: "無料相談・概算見積もり",
    regions: { eastAsia: "東アジア", southeastAsia: "東南アジア", northAmerica: "北米", europe: "ヨーロッパ", oceania: "オセアニア", other: "その他" },
  },
  en: {
    home: "Home",
    title: "Supported countries and regions",
    eyebrow: "Worldwide Support",
    lead: "For destinations not listed here, we confirm availability for each request.",
    menu: "Menu",
    consult: "Contact us",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
    inquiryTitle: "Planning a domestic or international move with your pet?",
    inquiryLead: "Tell us your destination, pet, and expected travel date, and we will guide you through the preparation you need.",
    inquiryAction: "Free consultation & estimate",
    regions: { eastAsia: "East Asia", southeastAsia: "Southeast Asia", northAmerica: "North America", europe: "Europe", oceania: "Oceania", other: "Other" },
  },
} as const;

function countryFlag(code: string) {
  if (code === "EU") return "🇪🇺";
  if (code === "WW") return "🌏";
  return String.fromCodePoint(...code.toUpperCase().split("").map((character) => 127397 + character.charCodeAt(0)));
}

export default async function FlightCountriesPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, countries, appConfig] = await Promise.all([
    searchParams,
    identityDispatcher({ action: "get_countries_config" }).catch(() => []),
    identityDispatcher({ action: "get_app_config" }).catch(() => null),
  ]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const visibleCountries = countries
    .filter((country) => country.status !== "paused")
    .sort((left, right) => left.sortOrder - right.sortOrder);
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    appConfig?.company.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." },
    language,
    "flight",
  );
  const consultationForm = await DirectionPage({
    params: Promise.resolve({ direction: "outbound" }),
    searchParams: Promise.resolve({ lang: language, standalone: "1", embed: "1" }),
  });

  return (
    <main className="min-h-dvh bg-[#f6f9fc] text-[#073273]" style={{ fontFamily: "var(--font-zen-maru-gothic)" }}>
      <header className="border-b border-[#d9e9f8] bg-white/95">
        <div className="mx-auto flex h-24 max-w-[1440px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Link href={`/flight?lang=${language}`} aria-label="PawsFlight Japan home">
            <Image className="h-auto w-[175px] sm:w-[250px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority />
          </Link>
          <div className="flex items-center gap-2">
            <nav className="flex rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold" aria-label="Language">
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/countries?lang=ja">JA</Link>
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/countries?lang=en">EN</Link>
            </nav>
            <Link href={`/flight/contact?lang=${language}`} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)] lg:flex"><Mail size={17} aria-hidden="true" />{text.inquiryAction}</Link>
            <button type="button" className="grid h-12 w-12 place-items-center rounded-full border border-[#b7d8f6] bg-white" aria-label={text.menu}><Menu aria-hidden="true" /></button>
          </div>
        </div>
      </header>

      <section className="bg-[linear-gradient(180deg,#edf6ff_0%,#f7fbff_100%)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="mx-auto max-w-[1100px]">
          <nav className="flex items-center gap-2 text-sm font-bold text-[#506783]" aria-label="Breadcrumb">
            <Link href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} aria-hidden="true" /><span>{text.title}</span>
          </nav>
          <div className="mt-12 text-center sm:mt-16">
            <p className="text-base font-bold tracking-[0.16em] text-[#398ee4] sm:text-lg">{text.eyebrow}</p>
            <h1 className="mt-4 flex items-center justify-center gap-3 text-3xl font-bold sm:text-5xl">{text.title}<Globe2 className="text-[#398ee4]" aria-hidden="true" /></h1>
            <p className="mx-auto mt-5 max-w-[780px] font-medium leading-8 text-[#506783]">{text.lead}</p>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto grid max-w-[1100px] gap-5 sm:grid-cols-2">
          {regions.map((region) => {
            const entries = visibleCountries.filter((country) => country.region === region);
            if (!entries.length) return null;
            return (
              <section key={region} className="rounded-3xl border border-[#d9e9f8] bg-[#f8fbff] p-6">
                <h2 className="text-xl font-bold">{text.regions[region]}</h2>
                <ul className="mt-4 flex flex-wrap gap-2">
                  {entries.map((country) => (
                    <li key={country.code} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-[#355477] shadow-sm">
                      <span aria-hidden="true">{countryFlag(country.code)}</span>{getTranslation(country.name, language)}
                      {country.status === "consult" ? <small className="text-[#7b8ea5]">{text.consult}</small> : null}
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>

      <section id="contact" className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        {consultationForm}
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
          <p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">{copyrightText}</p>
        </div>
      </footer>
    </main>
  );
}
