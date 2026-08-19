import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CircleHelp,
  FileCheck2,
  Globe2,
  Handshake,
  Heart,
  Mail,
  MessageCircleMore,
  PackageCheck,
  PawPrint,
  Plane,
  ShieldCheck,
  Truck,
  UsersRound,
} from "lucide-react";
import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import { BackToTop, FlightMenu, FlightSocial } from "@/components/toast";

export const metadata: Metadata = {
  title: "PawsFlight Japan",
  description: "PawsFlight Japan official website",
  icons: {
    icon: [
      {
        url: "/icons/paws_icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  },
};

const copy = {
  ja: {
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    brandReading: "パウズ・フライト・ジャパン",
    welcome: "Hello! PawsVoyager",
    voyagerReading: "パウズ・ボイジャー（肉球の旅人たち）",
    titleFirst: "世界中、",
    titleSecond: "どこへでも一緒に。",
    description: [
      "日本から海外へ、海外から日本へ。",
      "検疫準備から国内輸送、航空輸送まで、",
      "大切な家族の国際移動をサポートします。",
      "到着後は、現地空港でお迎えいただけます。",
    ],
    outbound: "日本から海外へ",
    inbound: "海外から日本へ",
    inquiry: "無料相談・お見積もり",
    features: [
      ["安心のサポート体制", "専門スタッフが伴走"],
      ["輸送方法をご提案", "状況に合わせてご案内"],
      ["世界中に対応", "幅広いネットワーク"],
    ],
    serviceEyebrow: "Our Services",
    serviceHeading: "PawsFlight Japanの輸送・サポート",
    serviceLead: "国際輸送から検疫、国内の空港関連輸送まで、必要なサポートをお選びいただけます。",
    serviceAction: "詳しく見る",
    unsureTitle: "どのサービスを選べばよいか分からない方へ",
    unsureDescription: "渡航先やご希望を伺い、必要な輸送・手続きをご案内します。",
    unsureAction: "まずは相談する",
    countriesEyebrow: "Worldwide Support",
    countriesHeading: "対応国・地域",
    countriesLead: "代表的な対応国です。渡航条件は国や時期によって異なるため、詳しくはご相談ください。",
    countriesAction: "対応国をすべて見る",
    backToTop: "ページ上部へ戻る",
    services: [
      ["日本から海外へのペット輸送", "検疫準備、国内輸送、航空輸送まで出発を一貫してサポートします。"],
      ["海外から日本へのペット輸送", "日本到着に必要な検疫手続きと輸送準備を丁寧にご案内します。"],
      ["動物検疫・書類サポート", "国や地域ごとに異なる検疫条件と必要書類の準備を支援します。"],
      ["在日米軍関係者向けペット輸送", "日本国内外の異動に伴うペット輸送を英語でもサポートします。"],
      ["日本国内の空港関連輸送", "ご自宅と国内空港の間を、安全に配慮して輸送します。"],
      ["国内ペット貨物輸送", "国内線の貨物輸送に必要な準備と空港への搬送を支援します。"],
    ],
    voyagerEyebrow: "WELCOME, PAWSVOYAGER!",
    voyagerHeading: "ようこそ、PawsVoyager。",
    voyagerDefinition: "PawsFlight Japan（パウズ・フライト・ジャパン）では、私たちとともに世界を旅するペットたちを「PawsVoyager（パウズ・ボイジャー／肉球の旅人たち）」と呼んでいます。",
    voyagerBody: "日本から海外へ、海外から日本へ。家族と一緒に新しい場所へ向かう、一頭一頭がPawsVoyager（パウズ・ボイジャー／肉球の旅人たち）の仲間です。",
    voyagerGallery: "Meet our PawsVoyagers",
    voyagerPhoto: "PawsVoyagerの写真",
    voyagerPhotoNote: "PawsVoyager Storyを準備中です",
    guideEyebrow: "How It Works",
    guideHeading: "国際ペット輸送を、もっと分かりやすく。",
    guideLead: "お問い合わせからお引渡しまで、必要な準備と輸送を一つの窓口でご案内します。",
    guideSteps: [
      ["相談・お見積もり", "渡航先や予定を伺い、必要な準備と費用をご案内します。"],
      ["渡航準備", "検疫条件や必要書類を確認し、出発に向けて準備します。"],
      ["輸送・お引渡し", "旅程に合った方法で輸送し、到着空港でお引渡しします。"],
    ],
    guideAction: "利用案内を見る",
    reasonsEyebrow: "Why PawsFlight",
    reasonsHeading: "PawsFlight Japanが選ばれる理由",
    reasons: [
      ["ペット輸送の経験", "国内で培ったペット輸送の経験を、国際移動の準備と輸送にも活かします。"],
      ["検疫から輸送までサポート", "国や地域によって異なる検疫条件を確認し、必要な手続きを分かりやすくご案内します。"],
      ["国内外の専門事業者と連携", "航空輸送や到着地で必要となる対応を、専門事業者と連携してコーディネートします。"],
    ],
    storiesEyebrow: "PawsVoyager Stories",
    storiesHeading: "一緒に世界を旅したPawsVoyagers",
    storiesLead: "渡航準備や輸送の様子を、これから事例としてご紹介します。",
    storiesPending: "輸送事例を準備中です",
    storiesAction: "もっと見る",
    faqEyebrow: "FAQ",
    faqHeading: "よくあるご質問",
    faqs: [
      ["何か月前から準備すればよいですか？", "渡航先によって必要な期間が異なります。予定が決まり次第、できるだけ早めにご相談ください。"],
      ["犬・猫以外も対応できますか？", "動物の種類、渡航先、航空会社の条件を確認したうえでご案内します。"],
      ["検疫手続きもお願いできますか？", "必要条件の確認や書類準備をサポートします。手続きの範囲は渡航先により異なります。"],
      ["輸送用クレートは用意してもらえますか？", "ペットのサイズと航空会社の条件に合うクレートについてご相談いただけます。"],
      ["費用はいくらですか？", "渡航先、ペットの種類や大きさ、輸送方法によって異なるため、内容を確認して概算をご案内します。"],
      ["海外から日本への輸送も可能ですか？", "はい。日本到着に必要な検疫準備と輸送についてご相談いただけます。"],
    ],
    finalHeading: ["大切な家族との国内外へのお引越し、", "まずはご相談ください。"],
    finalLead: "渡航先・ペットの種類・渡航予定日などを確認し、必要な準備をご案内します。",
    finalAction: "無料相談・概算見積もり",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
    footerContact: "お問い合わせ",
  },
  en: {
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    brandReading: "",
    welcome: "Hello! PawsVoyager",
    voyagerReading: "",
    titleFirst: "Together,",
    titleSecond: "anywhere in the world.",
    description: [
      "From Japan to the world, and from the world to Japan.",
      "We support every step of your pet's international journey,",
      "from quarantine preparation to safe door-to-door transport.",
    ],
    outbound: "From Japan",
    inbound: "To Japan",
    inquiry: "Free consultation",
    features: [
      ["Dedicated support", "Specialists by your side"],
      ["Tailored transport", "Guidance for every journey"],
      ["Worldwide coverage", "A trusted global network"],
    ],
    serviceEyebrow: "Our Services",
    serviceHeading: "Transport and support from PawsFlight Japan",
    serviceLead: "Choose the support you need, from international relocation and quarantine to domestic airport transport.",
    serviceAction: "Learn more",
    unsureTitle: "Not sure which service you need?",
    unsureDescription: "Tell us your destination and plans, and we will guide you through the right transport and procedures.",
    unsureAction: "Talk to us",
    countriesEyebrow: "Worldwide Support",
    countriesHeading: "Countries and regions",
    countriesLead: "These are some of our key destinations. Requirements vary by country and travel date, so please contact us for details.",
    countriesAction: "View all countries",
    backToTop: "Back to top",
    services: [
      ["Pet transport from Japan", "Support from quarantine preparation and domestic pickup through air transportation."],
      ["Pet transport to Japan", "Clear guidance for Japan's arrival quarantine and transportation requirements."],
      ["Quarantine and document support", "Help preparing the documents and procedures required by each country or region."],
      ["Support for U.S. military families", "English-language pet transportation support for relocations in and out of Japan."],
      ["Domestic airport transport", "Careful transportation between your home and airports across Japan."],
      ["Domestic pet cargo transport", "Preparation and airport delivery support for domestic air cargo travel."],
    ],
    voyagerEyebrow: "WELCOME, PAWSVOYAGER!",
    voyagerHeading: "Welcome, PawsVoyager.",
    voyagerDefinition: "At PawsFlight Japan, we call every pet traveling the world with us a “PawsVoyager.”",
    voyagerBody: "From Japan to the world, and from the world to Japan. Every pet beginning a new chapter with their family is a PawsVoyager.",
    voyagerGallery: "Meet our PawsVoyagers",
    voyagerPhoto: "PawsVoyager photo",
    voyagerPhotoNote: "PawsVoyager story details are coming soon",
    guideEyebrow: "How It Works",
    guideHeading: "Making international pet transport easier to understand.",
    guideLead: "One point of contact guides you through the preparation and transport needed from inquiry to handover.",
    guideSteps: [
      ["Consultation & estimate", "Tell us your destination and schedule, and we will outline the preparation and costs."],
      ["Travel preparation", "We review quarantine requirements and documents as you prepare for departure."],
      ["Transport & handover", "We arrange a suitable journey and hand your pet over at the arrival airport."],
    ],
    guideAction: "View the guide",
    reasonsEyebrow: "Why PawsFlight",
    reasonsHeading: "Why families choose PawsFlight Japan",
    reasons: [
      ["Pet transport experience", "We bring our domestic pet transport experience to every stage of international travel preparation."],
      ["Support from quarantine to transport", "We check destination-specific requirements and explain each necessary step clearly."],
      ["Coordination with specialists", "We coordinate with specialist partners for air travel and destination support when needed."],
    ],
    storiesEyebrow: "PawsVoyager Stories",
    storiesHeading: "PawsVoyagers who traveled the world with us",
    storiesLead: "Stories about their preparation and journeys will be shared here.",
    storiesPending: "Transport stories are coming soon",
    storiesAction: "View more",
    faqEyebrow: "FAQ",
    faqHeading: "Frequently asked questions",
    faqs: [
      ["How early should I start preparing?", "The required timeline depends on your destination. Please contact us as soon as your travel plans begin to take shape."],
      ["Can you transport animals other than dogs and cats?", "We will check the animal species, destination, and airline requirements before advising you."],
      ["Can you help with quarantine procedures?", "We support requirement checks and document preparation. The available scope depends on the destination."],
      ["Can you provide a travel crate?", "We can advise you on a crate suited to your pet's size and the airline's requirements."],
      ["How much does transport cost?", "Costs depend on the destination, pet, and transport method. We provide an estimate after reviewing your plans."],
      ["Can you transport pets from overseas to Japan?", "Yes. We can advise you on the quarantine preparation and transport needed for arrival in Japan."],
    ],
    finalHeading: ["Planning a domestic or international move with your pet?", "Start with a conversation."],
    finalLead: "Tell us your destination, pet, and expected travel date, and we will guide you through the preparation you need.",
    finalAction: "Free consultation & estimate",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
    footerContact: "Contact us",
  },
} as const;

const featureIcons = [ShieldCheck, Plane, Globe2] as const;
const serviceIcons = [Plane, Globe2, FileCheck2, UsersRound, Truck, PackageCheck] as const;
const guideIcons = [MessageCircleMore, FileCheck2, Handshake] as const;
const reasonIcons = [Heart, ShieldCheck, UsersRound] as const;
const voyagerPhotos = [
  "/images/flight/voyager/Voyager_01.jpg",
  "/images/flight/voyager/Voyager_02.JPG",
  "/images/flight/voyager/Voyager_03.JPG",
  "/images/flight/voyager/Voyager_04.jpg",
] as const;

function countryFlag(code: string) {
  if (code === "EU") return "🇪🇺";
  if (code === "WW") return "🌏";
  return String.fromCodePoint(...code.toUpperCase().split("").map((character) => 127397 + character.charCodeAt(0)));
}

export default async function FlightPage({
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
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    appConfig?.company.name ?? { ja: "Wan Da Nya Inc.", en: "Wan Da Nya Inc." },
    language,
    "flight",
  );
  const featuredCountries = [...(appConfig?.countries ?? [])]
    .filter((country) => country.status !== "paused")
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .slice(0, 5);
  const mobileMenuItems = [
    { label: text.nav[0], href: `/flight?lang=${language}#services` },
    { label: text.nav[1], href: `/flight/guide?lang=${language}` },
    { label: text.nav[2], href: `/flight/pricing?lang=${language}` },
    { label: text.nav[3], href: `/flight/stories?lang=${language}` },
    { label: text.nav[4], href: `/flight/faq?lang=${language}` },
    { label: text.nav[5], href: `/flight/company?lang=${language}` },
    {
      label: language === "ja" ? "対応国・地域" : "Countries & regions",
      href: `/flight/countries?lang=${language}`,
    },
  ];
  return (
    <main
      id="top"
      className="min-h-dvh bg-[#f6f9fc] text-[#073273]"
      style={{ fontFamily: "var(--font-zen-maru-gothic)" }}
    >
      <section className="relative isolate min-h-dvh overflow-hidden lg:min-h-[760px]">
        <Image
          className="absolute inset-0 -z-20 object-cover object-[88%_center] lg:object-center"
          src="/images/flight/flight_hero.png"
          alt="飛行機の窓辺で空を見つめる犬と猫"
          fill
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,255,255,0.98)_0%,rgba(255,255,255,0.94)_38%,rgba(255,255,255,0.28)_67%,rgba(255,255,255,0.02)_100%)] max-lg:bg-[linear-gradient(180deg,rgba(255,255,255,0.97)_0%,rgba(255,255,255,0.90)_46%,rgba(255,255,255,0.18)_78%,rgba(255,255,255,0.04)_100%)]" />

        <header className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-2 px-5 sm:gap-6 sm:px-8 lg:px-12">
          <div className="shrink-0">
            <Image
              className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]"
              src="/images/flight/logo.svg"
              alt="PawsFlight Japan"
              width={1200}
              height={300}
              priority
            />
            {text.brandReading ? (
              <p className="mt-1 text-[9px] font-bold tracking-[0.08em] text-[#355477] sm:text-xs">
                {text.brandReading}
              </p>
            ) : null}
          </div>

          <nav className="hidden items-center gap-6 text-base font-bold 2xl:gap-8 2xl:text-lg xl:flex" aria-label="メインナビゲーション">
            {text.nav.map((item, index) =>
              index === text.nav.length - 1 || index === 4 || index === 3 || index === 2 || index === 1 ? (
                <Link
                  key={item}
                  className="whitespace-nowrap transition-colors hover:text-[#398ee4]"
                  href={index === 1 ? `/flight/guide?lang=${language}` : index === 2 ? `/flight/pricing?lang=${language}` : index === 3 ? `/flight/stories?lang=${language}` : index === 4 ? `/flight/faq?lang=${language}` : `/flight/company?lang=${language}`}
                >
                  {item}
                </Link>
              ) : (
                <span key={item} className="whitespace-nowrap">
                  {item}
                </span>
              ),
            )}
          </nav>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white/90 p-1 text-xs font-bold shadow-sm" aria-label="Language">
              <Link
                className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`}
                href="/flight?lang=ja"
                lang="ja"
                aria-current={language === "ja" ? "page" : undefined}
              >
                JA
              </Link>
              <Link
                className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`}
                href="/flight?lang=en"
                lang="en"
                aria-current={language === "en" ? "page" : undefined}
              >
                EN
              </Link>
            </nav>

            <Link
              href={`/flight/contact?lang=${language}`}
              className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)] lg:flex"
            >
              <Mail size={17} aria-hidden="true" />
              {text.inquiry}
            </Link>

            <FlightMenu language={language} items={mobileMenuItems} contactLabel={text.inquiry} />
          </div>
        </header>

        <div className="mx-auto grid min-h-[calc(100dvh-6rem)] w-full max-w-[1440px] items-start px-6 pb-36 pt-16 sm:px-10 sm:pt-20 lg:min-h-[664px] lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-center lg:px-12 lg:pb-28 lg:pt-4">
          <div className="max-w-[650px]">
            <div className="mb-5 lg:mt-10">
              <p className="flex items-center gap-2 text-lg font-bold tracking-[0.07em] text-[#398ee4] sm:text-xl">
                <PawPrint size={18} aria-hidden="true" />
                {text.welcome}
              </p>
              {text.voyagerReading ? (
                <p className="ml-[26px] mt-1 text-xs font-bold tracking-[0.04em] text-[#506783] sm:text-sm">
                  {text.voyagerReading}
                </p>
              ) : null}
            </div>

            <h1 className="mt-4 text-[2.25rem] font-medium leading-[1.22] tracking-[-0.035em] text-[#073273] sm:mt-6 sm:text-[clamp(1.85rem,7vw,4.25rem)]">
              <span className="block">{text.titleFirst}</span>
              <span className="block sm:whitespace-nowrap">{text.titleSecond}</span>
            </h1>

            <div className="relative my-7 h-8 max-w-[590px] sm:my-9">
              <div className="absolute left-0 right-14 top-3 border-t-2 border-dashed border-[#67aef0]" />
              <Plane
                className="absolute right-2 top-0 rotate-[-8deg] text-[#398ee4]"
                size={32}
                aria-hidden="true"
              />
            </div>

            <p className="text-base font-medium leading-8 text-[#355477] sm:text-lg">
              {text.description.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
              <Link
                href={`/flight/outbound?lang=${language}`}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full bg-[#073273] px-7 text-base font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)]"
              >
                <Plane size={19} aria-hidden="true" />
                {text.outbound}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
              <Link
                href={`/flight/inbound?lang=${language}`}
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-full border border-[#073273] bg-white/90 px-7 text-base font-bold text-[#073273]"
              >
                <Globe2 size={19} aria-hidden="true" />
                {text.inbound}
                <ArrowRight size={18} aria-hidden="true" />
              </Link>
            </div>
            <FlightSocial language={language} tone="dark" layout="floating" align="start" />
          </div>
        </div>

        <div className="absolute bottom-5 left-1/2 grid w-[calc(100%-2rem)] max-w-[900px] -translate-x-1/2 grid-cols-3 overflow-hidden rounded-2xl border border-white/70 bg-white/85 shadow-[0_18px_55px_rgba(7,50,115,0.14)] backdrop-blur-md lg:bottom-8 lg:left-auto lg:right-[5%] lg:w-[46%] lg:translate-x-0">
          {text.features.map(([title, description], index) => {
            const Icon = featureIcons[index];
            const featureClassName = "flex min-h-20 flex-col items-center justify-center gap-1 border-r border-[#dceaf7] px-2 py-3 text-center last:border-r-0 sm:min-h-24 sm:flex-row sm:gap-3 sm:px-5 sm:py-4 sm:text-left";
            const featureContent = (
              <>
                <Icon className="shrink-0 text-[#1766ba]" size={29} aria-hidden="true" />
                <div>
                  <p className="text-[11px] font-bold leading-4 text-[#173b6c] sm:text-sm">{title}</p>
                  <p className="mt-1 hidden text-xs leading-5 text-[#506783] sm:block">{description}</p>
                </div>
              </>
            );

            return index === 2 ? (
              <Link
                key={title}
                className={`${featureClassName} transition-colors hover:bg-[#edf6ff]`}
                href={`/flight/countries?lang=${language}`}
              >
                {featureContent}
              </Link>
            ) : (
              <div
                key={title}
                className={featureClassName}
              >
                {featureContent}
              </div>
            );
          })}
        </div>
      </section>

      <section id="services" className="bg-[linear-gradient(180deg,#f6f9fc_0%,#edf6ff_100%)] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-[1200px] text-center">
            <p className="text-2xl font-bold tracking-[0.15em] text-[#398ee4] sm:text-3xl">
              {text.serviceEyebrow}
            </p>
            <h2 className="mt-3 text-3xl font-bold leading-tight text-[#073273] sm:text-4xl lg:whitespace-nowrap lg:text-[clamp(2.5rem,4vw,3.4rem)]">
              {text.serviceHeading}
            </h2>
            <p className="mx-auto mt-5 max-w-[1100px] text-base font-medium leading-8 text-[#506783] sm:text-lg lg:whitespace-nowrap">
              {text.serviceLead}
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:mt-16 lg:grid-cols-3 lg:gap-6">
            {text.services.map(([title, description], index) => {
              const Icon = serviceIcons[index];
              const serviceHref = index === 0
                ? `/flight/outbound?lang=${language}`
                : index === 1
                  ? `/flight/inbound?lang=${language}`
                  : index === 2
                    ? `/flight/quarantine?lang=${language}`
                    : index === 3
                      ? `/flight/military?lang=${language}`
                      : index === 4
                        ? `/flight/airport?lang=${language}`
                        : index === 5
                          ? `/flight/cargo?lang=${language}`
                          : null;

              return (
                <article
                  key={title}
                  className="group flex min-h-[250px] flex-col rounded-3xl border border-[#d9e9f8] bg-white p-6 shadow-[0_16px_45px_rgba(7,50,115,0.07)] transition-transform duration-200 hover:-translate-y-1 sm:p-7"
                >
                  <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf5ff] text-[#1766ba]">
                    <Icon size={28} aria-hidden="true" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold leading-8 text-[#073273]">{title}</h3>
                  <p className="mt-3 flex-1 text-sm font-medium leading-7 text-[#506783] sm:text-base">
                    {description}
                  </p>
                  {serviceHref ? (
                    <Link className="mt-5 inline-flex items-center gap-2 self-start font-bold text-[#1766ba]" href={serviceHref}>
                      {text.serviceAction}
                      <ArrowRight size={17} aria-hidden="true" />
                    </Link>
                  ) : (
                    <button type="button" className="mt-5 inline-flex items-center gap-2 self-start font-bold text-[#1766ba]">
                      {text.serviceAction}
                      <ArrowRight size={17} aria-hidden="true" />
                    </button>
                  )}
                </article>
              );
            })}
          </div>

          <div className="mt-8 flex flex-col items-start gap-5 rounded-3xl bg-[#073273] px-6 py-7 text-white shadow-[0_18px_45px_rgba(7,50,115,0.18)] sm:flex-row sm:items-center sm:justify-between sm:px-9 lg:mt-10">
            <div className="flex items-start gap-4">
              <CircleHelp className="mt-1 shrink-0 text-[#8dcbff]" size={30} aria-hidden="true" />
              <div>
                <h3 className="text-lg font-bold sm:text-xl">{text.unsureTitle}</h3>
                <p className="mt-2 text-sm font-medium leading-6 text-white/75 sm:text-base">
                  {text.unsureDescription}
                </p>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-3">
              <FlightSocial language={language} layout="inline" />
              <Link
                href={`/flight/contact?lang=${language}`}
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white px-6 font-bold text-[#073273]"
              >
                {text.unsureAction}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {featuredCountries.length ? (
        <section className="border-y border-[#d9e9f8] bg-white px-5 py-14 sm:px-8 sm:py-16 lg:px-12">
          <div className="mx-auto max-w-[1240px]">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-bold tracking-[0.16em] text-[#398ee4] sm:text-base">{text.countriesEyebrow}</p>
                <h2 className="mt-2 text-2xl font-bold text-[#073273] sm:text-3xl">{text.countriesHeading}</h2>
                <p className="mt-3 max-w-[820px] text-sm font-medium leading-7 text-[#506783] sm:text-base">{text.countriesLead}</p>
              </div>
              <Link className="inline-flex shrink-0 items-center gap-2 font-bold text-[#1766ba]" href={`/flight/countries?lang=${language}`}>
                {text.countriesAction}<ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
            <div className="-mx-5 mt-7 flex snap-x gap-3 overflow-x-auto px-5 pb-3 sm:mx-0 sm:px-0">
              {featuredCountries.map((country) => (
                <span key={country.code} className="inline-flex min-h-12 shrink-0 snap-start items-center gap-2 rounded-full border border-[#cfe4f7] bg-[#f3f9ff] px-5 font-bold text-[#173b6c]">
                  <span className="text-xl" aria-hidden="true">{countryFlag(country.code)}</span>
                  {country.name[language] || country.name.ja || country.code}
                </span>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <section id="stories" className="overflow-hidden bg-[linear-gradient(135deg,#062d69_0%,#0a4388_58%,#0d58a6_100%)] px-5 py-20 text-white sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto grid max-w-[1240px] gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-16">
          <div>
            <p className="text-2xl font-bold tracking-[0.15em] text-[#8dcbff] sm:text-3xl">
              {text.storiesEyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              {text.storiesHeading}
            </h2>
            <p className="mt-6 text-base font-medium leading-8 text-white/85 sm:text-lg">
              {text.storiesLead}
            </p>
            <p className="mt-6 text-sm font-medium leading-7 text-white/65 sm:text-base">
              {text.voyagerDefinition}
            </p>
            <Link
              href={`/flight/stories?lang=${language}`}
              className="mt-8 inline-flex min-h-12 items-center gap-2 rounded-full border border-white/70 bg-white px-6 font-bold text-[#073273] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition-colors hover:bg-[#eaf5ff]"
            >
              {text.storiesAction}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>

          <div>
            <h3 className="flex items-center gap-2 text-2xl font-bold text-white sm:text-3xl">
              <PawPrint className="text-[#8dcbff]" size={28} aria-hidden="true" />
              {text.voyagerGallery}
            </h3>
            <div className="-mx-5 mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-4 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
              {[1, 2, 3, 4].map((number) => (
                <article
                  key={number}
                  className="min-w-[72%] snap-center overflow-hidden rounded-3xl border border-white/30 bg-white shadow-[0_16px_40px_rgba(0,20,55,0.2)] sm:min-w-0"
                >
                  <div className="relative grid aspect-[4/5] place-items-center overflow-hidden bg-[radial-gradient(circle_at_50%_35%,#ffffff_0%,#e5f3ff_52%,#cfe7fb_100%)] text-[#398ee4]">
                    <Image
                      src={voyagerPhotos[number - 1]}
                      alt={{ ja: `PawsVoyagerとして旅したペット ${number}`, en: `PawsVoyager ${number}` }[language]}
                      fill
                      sizes="(max-width: 639px) 72vw, (max-width: 1023px) 50vw, 25vw"
                      className="object-cover object-center"
                    />
                  </div>
                  <div className="p-4">
                    <p className="font-bold text-[#173b6c]">{text.voyagerPhoto}</p>
                    <p className="mt-1 text-xs leading-5 text-[#667a94]">{text.voyagerPhotoNote}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="process" className="border-y border-[#c7e0f6] bg-[#e5f2ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1240px]">
          <div className="mx-auto max-w-[1240px] text-center">
            <p className="text-2xl font-bold tracking-[0.15em] text-[#398ee4] sm:text-3xl">{text.guideEyebrow}</p>
            <h2
              className={`mt-4 font-bold leading-tight text-[#073273] lg:text-[clamp(2.5rem,4vw,3.6rem)] ${
                language === "ja"
                  ? "whitespace-nowrap text-[clamp(1rem,4.6vw,2.5rem)]"
                  : "text-3xl sm:text-4xl"
              }`}
            >
              {text.guideHeading}
            </h2>
            <p className="mx-auto mt-5 max-w-[900px] text-base font-medium leading-8 text-[#506783] sm:text-lg">{text.guideLead}</p>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3 lg:mt-12">
            {text.guideSteps.map(([title, description], index) => {
              const Icon = guideIcons[index];
              return (
                <div key={title} className="flex items-start gap-4 rounded-3xl border border-[#bcd8f1] bg-white p-5 shadow-[0_12px_35px_rgba(7,50,115,0.08)] sm:p-6">
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf5ff] text-[#1766ba]">
                    <Icon size={24} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-xs font-bold text-[#67aef0]">STEP 0{index + 1}</p>
                    <h3 className="mt-1 text-lg font-bold leading-7 text-[#073273]">{title}</h3>
                    <p className="mt-2 text-sm font-medium leading-6 text-[#667a94]">{description}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <Link href={`/flight/guide?lang=${language}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1766ba] bg-white px-6 font-bold text-[#1766ba] transition-colors hover:bg-[#eaf5ff]">
              {text.guideAction}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[1240px]">
          <div className="text-center">
            <p className="text-2xl font-bold tracking-[0.15em] text-[#398ee4] sm:text-3xl">{text.reasonsEyebrow}</p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-[#073273] sm:text-4xl lg:text-5xl">{text.reasonsHeading}</h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3 lg:mt-16">
            {text.reasons.map(([title, description], index) => {
              const Icon = reasonIcons[index];
              return (
                <article key={title} className="rounded-3xl border border-[#c7ddf1] bg-[#f8fbff] p-7 shadow-[0_16px_45px_rgba(7,50,115,0.08)] sm:p-8">
                  <div className="flex items-center justify-between">
                    <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf5ff] text-[#1766ba]">
                      <Icon size={28} aria-hidden="true" />
                    </span>
                    <span className="text-4xl font-bold text-[#d8eafa]">0{index + 1}</span>
                  </div>
                  <h3 className="mt-6 text-xl font-bold leading-8 text-[#073273]">{title}</h3>
                  <p className="mt-4 text-sm font-medium leading-7 text-[#506783] sm:text-base">{description}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section id="faq" className="border-y border-[#e0eaf4] bg-[#f5f8fc] px-5 py-20 sm:px-8 sm:py-24 lg:px-12 lg:py-28">
        <div className="mx-auto max-w-[920px]">
          <div className="text-center">
            <p className="text-2xl font-bold tracking-[0.15em] text-[#398ee4] sm:text-3xl">{text.faqEyebrow}</p>
            <h2 className="mt-4 text-3xl font-bold text-[#073273] sm:text-4xl lg:text-5xl">{text.faqHeading}</h2>
          </div>
          <div className="mt-12 divide-y divide-[#d9e9f8] border-y border-[#d9e9f8]">
            {text.faqs.map(([question, answer]) => (
              <details key={question} className="group py-1">
                <summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold leading-7 text-[#073273] [&::-webkit-details-marker]:hidden">
                  <span className="flex items-start gap-3">
                    <span className="text-[#398ee4]">Q.</span>
                    {question}
                  </span>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eaf5ff] text-lg text-[#1766ba] transition-transform group-open:rotate-45">＋</span>
                </summary>
                <div className="pb-6 pl-8 pr-10 text-sm font-medium leading-7 text-[#506783] sm:text-base">
                  <span className="mr-2 font-bold text-[#398ee4]">A.</span>
                  {answer}
                </div>
              </details>
            ))}
          </div>
          <div className="mt-8 text-center">
            <Link href={`/flight/faq?lang=${language}`} className="inline-flex min-h-12 items-center gap-2 rounded-full border border-[#1766ba] bg-white px-6 font-bold text-[#1766ba] transition-colors hover:bg-[#eaf5ff]">
              {language === "ja" ? "よくある質問をすべて見る" : "View all frequently asked questions"}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      <section id="contact" className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center rounded-[2rem] bg-[#073273] px-6 py-12 text-center text-white shadow-[0_20px_55px_rgba(7,50,115,0.2)] sm:px-12 sm:py-16">
          <PawPrint className="-rotate-45 text-[#8dcbff]" size={54} strokeWidth={1.8} aria-hidden="true" />
          <h2 className="mt-5 max-w-[850px] text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">
            {text.finalHeading.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h2>
          <p className="mt-5 max-w-[760px] text-sm font-medium leading-7 text-white/75 sm:text-base">{text.finalLead}</p>
          <Link href={`/flight/contact?lang=${language}`} className="mt-8 inline-flex min-h-14 items-center gap-3 rounded-full bg-white px-7 font-bold text-[#073273]">
            <Mail size={18} aria-hidden="true" />
            {text.finalAction}
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
      <BackToTop label={text.backToTop} />
    </main>
  );
}
