import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, Mail, MapPin, Plane } from "lucide-react";

import { FlightMenu, FlightSocial } from "@/components/toast";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";

export const metadata: Metadata = {
  title: "PawsVoyager Stories | PawsFlight Japan",
  description: "PawsFlight Japanと一緒に世界を旅したPawsVoyagersをご紹介します。",
  icons: {
    icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }],
  },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    home: "ホーム",
    breadcrumb: "PawsVoyager Stories",
    eyebrow: "PawsVoyager Stories",
    title: "一緒に世界を旅した\nPawsVoyagers",
    lead: "新しい暮らしへ向かう大切な家族。それぞれの渡航準備と旅の記録をご紹介します。",
    definition: "PawsFlight Japanでは、私たちとともに世界を旅するペットたちを「PawsVoyager（パウズ・ボイジャー／肉球の旅人たち）」と呼んでいます。",
    story: "PawsVoyager Story",
    photoAlt: "PawsVoyagerとして旅したペット",
    pendingTitle: "旅の記録を準備中です",
    pendingBody: "写真や渡航先、準備の様子など、詳しいストーリーを順次掲載します。",
    routePending: "Journey details coming soon",
    inquiry: "無料相談・お見積もり",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    home: "Home",
    breadcrumb: "PawsVoyager Stories",
    eyebrow: "PawsVoyager Stories",
    title: "PawsVoyagers who traveled\nthe world with us",
    lead: "Meet the beloved family members beginning a new life, and discover the preparation behind their journeys.",
    definition: "At PawsFlight Japan, we call every pet traveling the world with us a “PawsVoyager.”",
    story: "PawsVoyager Story",
    photoAlt: "A pet who traveled as a PawsVoyager",
    pendingTitle: "Journey story coming soon",
    pendingBody: "Photos, destinations, preparation, and journey details will be added here.",
    routePending: "Journey details coming soon",
    inquiry: "Free consultation & estimate",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
  },
} as const;

const voyagerPhotos = [
  "/images/flight/voyager/Voyager_01.jpg",
  "/images/flight/voyager/Voyager_02.JPG",
  "/images/flight/voyager/Voyager_03.JPG",
  "/images/flight/voyager/Voyager_04.jpg",
] as const;

export default async function StoriesPage({ searchParams }: { searchParams: Promise<{ lang?: string | string[] }> }) {
  const [query, appConfig] = await Promise.all([
    searchParams,
    identityDispatcher({ action: "get_app_config" }).catch(() => null),
  ]);
  const language = query.lang === "en" ? "en" : "ja";
  const text = copy[language];
  const contactHref = `/flight/contact?lang=${language}`;
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    appConfig?.company?.name ?? { ja: "わんだにゃー株式会社", en: "Wan Da Nya Inc." },
    language,
    "flight",
  );
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
          <nav className="hidden items-center gap-7 text-base font-bold xl:flex" aria-label={language === "ja" ? "メインナビゲーション" : "Main navigation"}>{menuItems.map((item, index) => <Link key={item.label} className={`whitespace-nowrap transition-colors hover:text-[#398ee4] ${index === 3 ? "text-[#398ee4]" : ""}`} href={item.href} aria-current={index === 3 ? "page" : undefined}>{item.label}</Link>)}</nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3"><nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold shadow-sm" aria-label="Language"><Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/stories?lang=ja" lang="ja">JA</Link><Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href="/flight/stories?lang=en" lang="en">EN</Link></nav><Link href={contactHref} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white lg:flex"><Mail size={17} aria-hidden="true" />{text.inquiry}</Link><FlightMenu language={language} items={menuItems} contactLabel={text.inquiry} contactHref={contactHref} /></div>
        </div>
      </header>

      <section className="overflow-hidden bg-[linear-gradient(135deg,#062d69_0%,#0a4388_58%,#0d58a6_100%)] px-5 py-12 text-white sm:px-8 sm:py-16 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1240px]"><nav className="flex items-center gap-2 text-sm font-bold text-white/65" aria-label={language === "ja" ? "パンくずリスト" : "Breadcrumb"}><Link className="hover:text-white" href={`/flight?lang=${language}`}>{text.home}</Link><ChevronRight size={16} aria-hidden="true" /><span aria-current="page" className="text-white">{text.breadcrumb}</span></nav><div className="mt-12 max-w-[950px]"><p className="text-xl font-bold tracking-[0.15em] text-[#8dcbff] sm:text-2xl">{text.eyebrow}</p><h1 className="mt-5 whitespace-pre-line text-4xl font-bold leading-[1.3] sm:text-5xl lg:text-6xl">{text.title}</h1><p className="mt-6 max-w-[850px] text-base font-medium leading-8 text-white/80 sm:text-lg">{text.lead}</p><p className="mt-5 max-w-[850px] text-sm font-medium leading-7 text-white/60 sm:text-base">{text.definition}</p></div></div>
      </section>

      <section className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto grid max-w-[1240px] gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((number) => (
            <article key={number} className="overflow-hidden rounded-[2rem] border border-[#d9e9f8] bg-white shadow-[0_16px_45px_rgba(7,50,115,0.08)]">
              <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#e5f3ff_52%,#cfe7fb_100%)] text-[#398ee4]">
                <Image src={voyagerPhotos[number - 1]} alt={`${text.photoAlt} ${number}`} fill sizes="(max-width:639px) 100vw, (max-width:1023px) 50vw, 25vw" className="object-cover object-center" priority={number === 1} />
              </div>
              <div className="p-6"><p className="text-sm font-bold tracking-[0.1em] text-[#398ee4]">{text.story} {String(number).padStart(2, "0")}</p><h2 className="mt-3 text-xl font-bold">{text.pendingTitle}</h2><p className="mt-3 text-sm font-medium leading-7 text-[#506783]">{text.pendingBody}</p><p className="mt-5 flex items-center gap-2 border-t border-[#d9e9f8] pt-4 text-xs font-bold text-[#7890ad]"><MapPin size={16} aria-hidden="true" />{text.routePending}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12"><div className="mx-auto flex max-w-[1000px] flex-col items-center rounded-[2rem] bg-[#073273] px-6 py-10 text-center text-white sm:px-10"><Plane className="text-[#8dcbff]" size={34} aria-hidden="true" /><p className="mt-4 max-w-[760px] text-lg font-bold leading-8">{language === "ja" ? "新しいPawsVoyagerの旅の記録を、順次ご紹介します。" : "More PawsVoyager journeys will be shared here."}</p></div></section>

      <footer className="bg-[#073273] px-5 py-10 text-white sm:px-8 sm:py-12"><div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-white/80 sm:text-sm" aria-label={language === "ja" ? "サイトマップ" : "Sitemap"}>{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} className="hover:text-white" href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link className="hover:text-white" href={contactHref}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/65 sm:text-sm"><span className="font-bold text-white/80">{text.footerServices}</span><a className="hover:text-white" href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a className="hover:text-white" href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} tone="light" /><p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">{copyrightText}</p></div></footer>
    </main>
  );
}
