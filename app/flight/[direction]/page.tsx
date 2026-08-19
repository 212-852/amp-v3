import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeftRight,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  FileCheck2,
  Globe2,
  Mail,
  MapPin,
  PawPrint,
  Plane,
} from "lucide-react";

import { defaultCopyright, getCopyright } from "@/lib/content";
import { identityDispatcher } from "@/lib/identity";
import { BackToTop, FlightMenu, FlightSocial } from "@/components/toast";
import { Address } from "@/components/address";
import { Crates } from "@/components/crates";

type Direction = "outbound" | "inbound";
type Language = "ja" | "en";

const copy = {
  ja: {
    home: "ホーム",
    menu: "メニュー",
    inquiry: "無料相談・お見積もり",
    nav: ["サービス", "ご利用の流れ", "料金", "事例", "よくあるご質問", "会社概要"],
    diagnosis: "かんたん事前確認",
    diagnosisLead: "分かる範囲で入力すると、ご相談時に必要な準備をご案内しやすくなります。",
    departure: "出発国",
    arrival: "到着国",
    date: "渡航予定日",
    petDetails: "ペットについて詳しく",
    petDetailsLead: "ペットの種類・犬種・頭数・年齢・体重・健康上の注意点・特殊な輸送条件などをご記入ください。",
    petDetailsPlaceholder: "例：犬／フレンチブルドッグ／2頭／3歳・5歳／各10kg／投薬あり／温度管理について相談したい",
    support: "希望するサポート",
    traveller: "同行者",
    petOnly: "ペットのみ",
    petWithPerson: "ペットと人",
    petOnlyNote: "「ペットのみ」は、弊社スタッフが同行するハンドキャリー便となります。",
    transportMethod: "航空輸送の方法",
    cargo: "貨物",
    checkedBaggage: "受託手荷物",
    undecided: "未定・相談したい",
    transit: "羽田・成田間トランジット",
    transitHelp: "日本到着後、羽田空港と成田空港の間を移動し、別の便へ乗り継ぐ場合の空港間輸送サポートです。",
    domesticTransport: "日本国内の陸送",
    domesticTransportHelp: "日本到着後の空港から、ご自宅・滞在先など日本国内の目的地までペットを陸送します。出発時のご自宅から国内空港までの輸送もご相談いただけます。",
    needed: "必要",
    notNeeded: "不要",
    unknown: "分からない・相談したい",
    destinationAddress: "日本国内の滞在先・お届け先住所",
    otherCountry: "その他",
    selectCountry: "国を選択してください",
    placeholderCountry: "国名を入力",
    placeholderSupport: "検疫、書類、国内輸送、航空輸送など",
    specialRequirements: "犬種・特殊な輸送条件",
    specialRequirementsLead: "短頭種、特定犬種、健康上の注意点、特別な取り扱いなどがあればご記入ください。",
    specialRequirementsPlaceholder: "例：フレンチブルドッグ、投薬あり、温度管理について相談したい",
    crateType: "輸送用クレート",
    cratePlastic: "プラスチッククレート",
    crateMetal: "メタルクレート",
    crateWood: "木製クレート",
    crateOther: "その他・相談したい",
    diagnosisAction: "相談内容を確認する",
    resultTitle: "必要な準備の目安",
    resultLead: "入力内容をもとに、まず次の準備確認から始めます。正式な条件と費用は個別に確認してご案内します。",
    resultItems: ["渡航先・出発国の検疫条件", "必要なワクチン・書類と準備期間", "利用できる航空輸送・国内輸送方法"],
    resultAction: "この内容で相談する",
    guideEyebrow: "Travel Guide",
    period: "準備期間の目安",
    price: "概算料金",
    periodText: "渡航先や検疫条件によって異なるため、予定が決まり次第お早めにご相談ください。",
    priceText: "渡航先、ペットの種類・大きさ、輸送方法、必要な手続きから個別にご案内します。",
    faq: "よくある質問",
    faqItems: [
      ["いつ相談すればよいですか？", "国や地域によって準備期間が大きく異なります。渡航予定が決まり次第ご相談ください。"],
      ["輸送方法は選べますか？", "ペットの種類・大きさ、航空会社、渡航先の条件を確認し、安全性を優先してご提案します。"],
      ["まだ日程が確定していなくても相談できますか？", "はい。おおよその時期と渡航先だけでも、準備の目安をご案内できます。"],
    ],
    finalHeading: "世界中、どこへでも一緒に。",
    finalLead: "出発国・到着国・予定日・ペットの情報を伺い、必要な準備と輸送方法をご案内します。",
    finalAction: "無料相談・概算見積もり",
    backToTop: "ページ上部へ戻る",
    footerLegal: ["利用規約", "プライバシーポリシー", "キャンセルポリシー", "特商法表記"],
    footerContact: "お問い合わせ",
    contactTitle: "お問い合わせ",
    contactLead: "サービスに関するご質問やご相談内容をお送りください。",
    contactName: "お名前",
    contactEmail: "メールアドレス",
    contactMessage: "お問い合わせ内容",
    contactSend: "送信内容を確認する",
    footerServices: "その他サービス",
    footerServiceLinks: ["ペットタクシー", "空港シャトル"],
  },
  en: {
    home: "Home",
    menu: "Menu",
    inquiry: "Free consultation",
    nav: ["Services", "Process", "Pricing", "Stories", "FAQ", "Company"],
    diagnosis: "Quick travel check",
    diagnosisLead: "Share what you know so we can give you a clearer preparation guide during your consultation.",
    departure: "Departure country",
    arrival: "Arrival country",
    date: "Expected travel date",
    petDetails: "Pet details",
    petDetailsLead: "Please include species, breed, number of pets, age, weight, health considerations and any special transport requirements.",
    petDetailsPlaceholder: "e.g. Dog / French Bulldog / 2 pets / ages 3 and 5 / 10 kg each / medication required / temperature-control advice needed",
    support: "Support needed",
    traveller: "Who is travelling",
    petOnly: "Pet only",
    petWithPerson: "Pet with people",
    petOnlyNote: "“Pet only” means that one of our staff members accompanies your pet as a hand-carry service.",
    transportMethod: "Air transport method",
    cargo: "Cargo",
    checkedBaggage: "Checked baggage",
    undecided: "Not decided / need advice",
    transit: "Transit between Haneda and Narita",
    transitHelp: "Airport-to-airport transport support when your pet arrives at one of Haneda or Narita and connects to another flight from the other airport.",
    domesticTransport: "Ground transport in Japan",
    domesticTransportHelp: "We can arrange ground transport for your pet between an airport in Japan and your home, accommodation, or another destination in Japan.",
    needed: "Needed",
    notNeeded: "Not needed",
    unknown: "Not sure / need advice",
    destinationAddress: "Address of the stay or delivery destination in Japan",
    otherCountry: "Other",
    selectCountry: "Select a country",
    placeholderCountry: "Enter country",
    placeholderSupport: "Quarantine, documents, transport, etc.",
    specialRequirements: "Breed and special transport requirements",
    specialRequirementsLead: "Tell us about brachycephalic or restricted breeds, health considerations, medication, or special handling needs.",
    specialRequirementsPlaceholder: "e.g. French Bulldog, medication required, need advice on temperature control",
    crateType: "Travel crate",
    cratePlastic: "Plastic crate",
    crateMetal: "Metal crate",
    crateWood: "Wooden crate",
    crateOther: "Other / need advice",
    diagnosisAction: "Continue to consultation",
    resultTitle: "Your preparation outline",
    resultLead: "Based on the information entered, we will begin with the checks below. We confirm the final requirements and estimate individually.",
    resultItems: ["Quarantine rules for the origin and destination", "Required vaccines, documents, and preparation time", "Available air and domestic transport methods"],
    resultAction: "Continue with these details",
    guideEyebrow: "Travel Guide",
    period: "Preparation timeline",
    price: "Estimated cost",
    periodText: "Timelines vary by destination and quarantine requirements. Please contact us as soon as your plans begin to take shape.",
    priceText: "We provide an individual estimate based on destination, pet size, transport method, and required procedures.",
    faq: "Frequently asked questions",
    faqItems: [
      ["When should I contact you?", "Preparation times vary significantly by country and region. Please contact us as soon as your travel plans begin to take shape."],
      ["Can I choose the transport method?", "We review your pet, airline, and destination requirements and recommend a suitable method with safety as the priority."],
      ["Can I ask before my date is confirmed?", "Yes. An approximate date and destination are enough for us to outline the likely preparation steps."],
    ],
    finalHeading: "Start your pet's journey with a clear plan.",
    finalLead: "Tell us your departure, destination, expected date, and pet details, and we will guide you through the preparation and transport options.",
    finalAction: "Free consultation & estimate",
    backToTop: "Back to top",
    footerLegal: ["Terms", "Privacy", "Cancellation", "Legal notice"],
    footerContact: "Contact us",
    contactTitle: "Contact us",
    contactLead: "Send us your questions or general inquiries about our services.",
    contactName: "Name",
    contactEmail: "Email address",
    contactMessage: "Message",
    contactSend: "Review message",
    footerServices: "Other services",
    footerServiceLinks: ["Pet Taxi", "Airport Shuttle"],
  },
} as const;

const directionCopy = {
  outbound: {
    ja: {
      breadcrumb: "日本から海外へ",
      eyebrow: "From Japan to the World",
      title: "日本から海外へ",
      lead: "渡航先の検疫条件から国内空港への輸送、航空輸送まで、出発に必要な準備を順番にご案内します。",
      steps: [
        ["渡航先・予定日の確認", "渡航先、出発予定日、利用空港、ペットの種類と頭数を確認します。"],
        ["渡航先国の検疫条件", "国や地域ごとに異なる入国条件と準備期間を確認します。"],
        ["ワクチン・マイクロチップ・必要書類", "接種記録や個体識別、証明書など必要な準備を整理します。"],
        ["自宅から国内空港までの輸送", "ご自宅から出発空港までの安全な国内輸送をご案内します。"],
        ["航空輸送方法", "ハンドキャリー・受託手荷物・貨物輸送から、条件に合う方法をご提案します。"],
        ["出国当日の流れ", "空港での受付、必要書類、受け渡しの流れを事前に確認します。"],
        ["到着後のお迎え方法", "到着空港でのお迎えや、現地事業者との連携範囲をご案内します。"],
      ],
    },
    en: {
      breadcrumb: "From Japan",
      eyebrow: "From Japan to the World",
      title: "Departing Japan with your pet",
      lead: "We guide you step by step, from destination quarantine requirements and domestic airport transport to the flight itself.",
      steps: [
        ["Confirm destination and date", "We review your destination, expected departure, airports, pet type, and number of pets."],
        ["Destination quarantine requirements", "We check the entry conditions and preparation period for your destination."],
        ["Vaccines, microchip, and documents", "We organize the required identification, vaccination records, and certificates."],
        ["Transport to the departure airport", "We can guide you through safe domestic transport from home to the airport."],
        ["Air transport method", "We recommend hand carry, checked baggage, or cargo transport according to the applicable conditions."],
        ["Departure-day process", "We explain airport check-in, document checks, and handover in advance."],
        ["Pickup after arrival", "We clarify airport pickup and any coordination available with destination partners."],
      ],
    },
  },
  inbound: {
    ja: {
      breadcrumb: "海外から日本へ",
      eyebrow: "From the World to Japan",
      title: "海外から日本へ",
      lead: "日本の動物検疫に必要な準備から航空輸送、日本到着後のお引渡しまで、帰国・入国の流れをご案内します。",
      steps: [
        ["出発国・日本到着日の確認", "出発国、日本の到着空港、到着予定日、ペットの情報を確認します。"],
        ["日本の動物検疫条件", "出発国・地域に応じて必要になる日本の輸入条件を整理します。"],
        ["マイクロチップ・狂犬病予防接種", "識別番号と接種時期が日本の条件を満たすか確認します。"],
        ["抗体価検査・待機期間", "必要な検査と採血後の待機期間を渡航予定から逆算します。"],
        ["輸出国政府機関の証明書", "出発国の政府機関が発行・裏書する証明書の準備をご案内します。"],
        ["日本の動物検疫所への事前届出", "到着予定に合わせて、輸入の事前届出に必要な情報を確認します。"],
        ["航空輸送方法", "ペットと旅程に合う航空会社・輸送方法を確認します。"],
        ["日本到着後の検疫・お引渡し", "到着空港での検疫確認からお引渡しまでの流れをご案内します。"],
        ["到着空港から目的地までの国内輸送", "検疫後、空港からご自宅など目的地までの輸送にも対応します。"],
      ],
    },
    en: {
      breadcrumb: "To Japan",
      eyebrow: "From the World to Japan",
      title: "Entering or returning to Japan with your pet",
      lead: "We guide you through Japan's animal quarantine preparation, air transport, arrival inspection, and onward domestic transport.",
      steps: [
        ["Confirm origin and arrival date", "We review the departure country, Japanese arrival airport, expected date, and pet details."],
        ["Japan's animal quarantine rules", "We organize the import requirements that apply to the country or region of origin."],
        ["Microchip and rabies vaccinations", "We check identification and vaccination timing against Japan's requirements."],
        ["Rabies antibody test and waiting period", "We calculate required testing and waiting periods from the expected travel date."],
        ["Government-endorsed certificate", "We explain the certificate required from the exporting country's government authority."],
        ["Advance notification to Japan", "We confirm the information needed for advance notification to the Animal Quarantine Service."],
        ["Air transport method", "We review airlines and transport methods suitable for the pet and itinerary."],
        ["Arrival quarantine and handover", "We explain the process from arrival inspection through handover at the airport."],
        ["Domestic transport after arrival", "After quarantine clearance, we can transport your pet from the airport to the destination."],
      ],
    },
  },
} as const;

const supportCopy = {
  outbound: {
    ja: [
      ["quarantine-documents", "検疫・必要書類"],
      ["air-transport", "航空輸送（受託手荷物）"],
      ["cargo", "貨物輸送"],
      ["military-pcs", "在日米軍PCSオーダー"],
      ["domestic-airport", "国内陸送"],
    ],
    en: [
      ["quarantine-documents", "Quarantine and documents"],
      ["air-transport", "Air transport (checked baggage)"],
      ["cargo", "Cargo transport"],
      ["military-pcs", "U.S. military PCS order support"],
      ["domestic-airport", "Ground transport in Japan"],
    ],
  },
  inbound: {
    ja: [
      ["quarantine-documents", "日本到着時の検疫・必要書類"],
      ["advance-notification", "動物検疫所への事前届出"],
      ["flight-arrangement", "航空会社・旅程の確認"],
      ["arrival-support", "日本到着時の空港対応"],
      ["military-pcs", "在日米軍PCSオーダー"],
    ],
    en: [
      ["quarantine-documents", "Arrival quarantine and documents"],
      ["advance-notification", "Advance notification to Animal Quarantine"],
      ["flight-arrangement", "Airline and itinerary review"],
      ["arrival-support", "Arrival airport support in Japan"],
      ["military-pcs", "U.S. military PCS order support"],
    ],
  },
} as const;

function isDirection(value: string): value is Direction {
  return value === "outbound" || value === "inbound";
}

export async function generateStaticParams() {
  return [{ direction: "outbound" }, { direction: "inbound" }];
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ direction: string }>;
  searchParams: Promise<{ lang?: string | string[] }>;
}): Promise<Metadata> {
  const [{ direction }, query] = await Promise.all([params, searchParams]);
  if (!isDirection(direction)) return {};

  const language = query.lang === "en" ? "en" : "ja";
  const title = language === "en"
    ? direction === "outbound"
      ? "Pet Transport from Japan | PawsFlight Japan"
      : "Pet Transport to Japan | PawsFlight Japan"
    : direction === "outbound"
      ? "日本から海外へのペット輸送 | PawsFlight Japan"
      : "海外から日本へのペット輸送 | PawsFlight Japan";
  const description = language === "en"
    ? direction === "outbound"
      ? "A clear guide to quarantine, documents, domestic pickup, and air transport for pets departing Japan."
      : "A clear guide to Japan's animal quarantine, advance notification, air transport, and domestic delivery for pets entering Japan."
    : direction === "outbound"
      ? "日本から海外へのペット輸送に必要な検疫、書類、国内輸送、航空輸送の流れをご案内します。"
      : "海外から日本へのペット輸送に必要な動物検疫、事前届出、航空輸送、国内輸送の流れをご案内します。";

  return {
    title,
    description,
    icons: { icon: [{ url: "/icons/paws_icon.svg", sizes: "any", type: "image/svg+xml" }] },
  };
}

export default async function DirectionPage({
  params,
  searchParams,
}: {
  params: Promise<{ direction: string }>;
  searchParams: Promise<{
    lang?: string | string[];
    departure?: string | string[];
    arrival?: string | string[];
    country?: string | string[];
    date?: string | string[];
    petDetails?: string | string[];
    support?: string | string[];
    special?: string | string[];
    crate?: string | string[];
    traveller?: string | string[];
    transport?: string | string[];
    transit?: string | string[];
    ground?: string | string[];
    destinationPrefecture?: string | string[];
    destinationCity?: string | string[];
    destinationDetail?: string | string[];
    standalone?: string | string[];
    embed?: string | string[];
    form?: string | string[];
    sent?: string | string[];
    error?: string | string[];
  }>;
}) {
  const [{ direction }, query, appConfig] = await Promise.all([
    params,
    searchParams,
    identityDispatcher({ action: "get_app_config" }).catch(() => null),
  ]);
  if (!isDirection(direction)) notFound();

  const language: Language = query.lang === "en" ? "en" : "ja";
  const embedded = query.embed === "1";
  const standalone = query.standalone === "1" || embedded;
  const simpleInquiry = standalone && query.form === "inquiry";
  const text = copy[language];
  const contactPageLabel = simpleInquiry ? text.contactTitle : text.inquiry;
  const page = directionCopy[direction][language];
  const fieldValue = (value: string | string[] | undefined) => typeof value === "string" ? value : "";
  const supportValues = Array.isArray(query.support)
    ? query.support
    : typeof query.support === "string"
      ? [query.support]
      : [];
  const diagnosis = {
    departure: fieldValue(query.departure) || (direction === "inbound" ? fieldValue(query.country) : ""),
    arrival: fieldValue(query.arrival) || (direction === "outbound" ? fieldValue(query.country) : ""),
    date: fieldValue(query.date),
    petDetails: fieldValue(query.petDetails),
    support: supportValues,
    special: fieldValue(query.special),
    crate: fieldValue(query.crate),
    traveller: fieldValue(query.traveller),
    transport: fieldValue(query.transport),
    transit: fieldValue(query.transit),
    ground: fieldValue(query.ground),
    address: {
      prefectureCode: fieldValue(query.destinationPrefecture),
      cityCode: fieldValue(query.destinationCity),
      detail: fieldValue(query.destinationDetail),
    },
  };
  const hasDiagnosis = Object.entries(diagnosis).some(([key, value]) => {
    if (key === "address") return Object.values(value).some(Boolean);
    return Array.isArray(value) ? value.length > 0 : Boolean(value);
  });
  const supportOptions = supportCopy[direction][language];
  const countries = (appConfig?.countries ?? [])
    .filter((country) => country.status !== "paused")
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const copyrightText = getCopyright(
    appConfig?.copyright ?? defaultCopyright,
    appConfig?.company.name ?? { ja: "Wan Da Nya Inc.", en: "Wan Da Nya Inc." },
    language,
    "flight",
  );
  const socialChannels = {
    sms: process.env.NEXT_PUBLIC_FLIGHT_MESSAGES_URL ?? "",
    whatsapp: process.env.NEXT_PUBLIC_FLIGHT_WHATSAPP_URL ?? "",
    line: process.env.NEXT_PUBLIC_FLIGHT_LINE_URL ?? "",
    instagram: process.env.NEXT_PUBLIC_FLIGHT_INSTAGRAM_URL ?? "",
  };
  const basePath = `/flight/${direction}`;
  const oppositeDirection: Direction = direction === "outbound" ? "inbound" : "outbound";
  const selectedCountry = direction === "outbound" ? diagnosis.arrival : diagnosis.departure;
  const selectedCountryKey = oppositeDirection === "outbound" ? "arrival" : "departure";
  const swapHref = `/flight/${oppositeDirection}?lang=${language}${selectedCountry ? `&${selectedCountryKey}=${encodeURIComponent(selectedCountry)}` : ""}#guide`;
  const mobileMenuItems = [
    { label: text.nav[1], href: `/flight/guide?lang=${language}` },
    { label: text.nav[2], href: `/flight/pricing?lang=${language}` },
    { label: text.home, href: `/flight?lang=${language}` },
    { label: page.breadcrumb, href: `${basePath}?lang=${language}#guide` },
    { label: text.faq, href: `/flight/faq?lang=${language}` },
    { label: text.nav[3], href: `/flight/stories?lang=${language}` },
    { label: text.inquiry, href: `/flight/contact?lang=${language}&direction=${direction}` },
    { label: text.nav[5], href: `/flight/company?lang=${language}` },
  ];
  const breadcrumbItems = standalone
    ? [
        { name: text.home, url: `https://paws-flight.com/flight?lang=${language}` },
        { name: contactPageLabel, url: `https://paws-flight.com/flight/contact?lang=${language}` },
      ]
    : [
        { name: text.home, url: `https://paws-flight.com/flight?lang=${language}` },
        { name: page.breadcrumb, url: `https://paws-flight.com${basePath}?lang=${language}` },
      ];
  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  const Root = embedded ? "div" : "main";

  return (
    <Root id="top" className={`${embedded ? "" : "min-h-dvh bg-[#f6f9fc]"} text-[#073273]`} style={{ fontFamily: "var(--font-zen-maru-gothic)" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd).replace(/</g, "\\u003c"),
        }}
      />
      {!embedded ? <header className="border-b border-[#d9e9f8] bg-white/95">
        <div className="mx-auto flex h-24 w-full max-w-[1440px] items-center justify-between gap-3 px-5 sm:px-8 lg:px-12">
          <Link href={`/flight?lang=${language}`} aria-label="PawsFlight Japan home">
            <Image className="h-auto w-[175px] sm:w-[250px] lg:w-[300px]" src="/images/flight/logo.svg" alt="PawsFlight Japan" width={1200} height={300} priority />
          </Link>
          <nav className="hidden items-center gap-7 text-base font-bold xl:flex" aria-label={language === "ja" ? "メインナビゲーション" : "Main navigation"}>
            {text.nav.map((item, index) => (
              <Link key={item} className="whitespace-nowrap transition-colors hover:text-[#398ee4]" href={index === 5 ? `/flight/company?lang=${language}` : index === 4 ? `/flight/faq?lang=${language}` : index === 3 ? `/flight/stories?lang=${language}` : index === 2 ? `/flight/pricing?lang=${language}` : index === 1 ? `/flight/guide?lang=${language}` : `/flight?lang=${language}#${index === 0 ? "services" : "contact"}`}>
                {item}
              </Link>
            ))}
          </nav>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <nav className="flex items-center rounded-full border border-[#b7d8f6] bg-white p-1 text-xs font-bold shadow-sm" aria-label="Language">
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "ja" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href={standalone ? `/flight/contact?lang=ja&direction=${direction}${simpleInquiry ? "&form=inquiry" : ""}` : `${basePath}?lang=ja`} lang="ja" aria-current={language === "ja" ? "page" : undefined}>JA</Link>
              <Link className={`grid h-9 min-w-9 place-items-center rounded-full px-2 ${language === "en" ? "bg-[#073273] text-white" : "text-[#355477]"}`} href={standalone ? `/flight/contact?lang=en&direction=${direction}${simpleInquiry ? "&form=inquiry" : ""}` : `${basePath}?lang=en`} lang="en" aria-current={language === "en" ? "page" : undefined}>EN</Link>
            </nav>
            <Link href={`/flight/contact?lang=${language}&direction=${direction}`} className="hidden min-h-12 shrink-0 items-center gap-2 rounded-full bg-[#073273] px-6 text-sm font-bold text-white shadow-[0_12px_30px_rgba(7,50,115,0.2)] lg:flex"><Mail size={17} aria-hidden="true" />{text.inquiry}</Link>
            <FlightMenu language={language} items={mobileMenuItems} contactLabel={text.inquiry} />
          </div>
        </div>
      </header> : null}

      {standalone && !embedded ? (
        <div className="bg-[#edf6ff] px-5 pt-8 sm:px-8 sm:pt-10 lg:px-12">
          <nav className="mx-auto flex max-w-[1240px] items-center gap-2 text-sm font-bold text-[#506783]" aria-label={language === "ja" ? "パンくずリスト" : "Breadcrumb"}>
            <Link className="hover:text-[#1766ba]" href={`/flight?lang=${language}`}>{text.home}</Link>
            <ChevronRight size={16} aria-hidden="true" />
            <span aria-current="page" className="text-[#073273]">{contactPageLabel}</span>
          </nav>
        </div>
      ) : null}

      {!standalone ? <><section className="bg-[linear-gradient(180deg,#edf6ff_0%,#f8fbff_100%)] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-20">
        <div className="mx-auto max-w-[1240px]">
          <nav className="flex items-center gap-2 text-sm font-bold text-[#506783]" aria-label="Breadcrumb">
            <Link className="hover:text-[#1766ba]" href={`/flight?lang=${language}`}>{text.home}</Link>
            <ChevronRight size={16} aria-hidden="true" />
            <span aria-current="page" className="text-[#073273]">{page.breadcrumb}</span>
          </nav>
          <div className="mt-12 grid items-center gap-10 sm:mt-16 lg:grid-cols-[1.05fr_0.95fr]">
            <div><p className="text-lg font-bold tracking-[0.14em] text-[#398ee4] sm:text-xl">{page.eyebrow}</p><h1 className="mt-5 text-4xl font-bold leading-[1.35] text-[#073273] sm:text-5xl lg:text-6xl">{page.title}</h1><p className="mt-6 max-w-[760px] text-base font-medium leading-8 text-[#506783] sm:text-lg">{page.lead}</p></div>
            <div className="rounded-[2rem] border border-white bg-white/90 p-8 shadow-[0_20px_60px_rgba(7,50,115,0.1)]">
              <div className="flex items-center gap-4"><span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#073273] text-white">{direction === "outbound" ? <Plane size={32} aria-hidden="true" /> : <Globe2 size={32} aria-hidden="true" />}</span><div><p className="font-bold text-[#398ee4]">{direction === "outbound" ? "FROM JAPAN" : "TO JAPAN"}</p><p className="mt-1 text-xl font-bold">{direction === "outbound" ? "Japan → Worldwide" : "Worldwide → Japan"}</p></div></div>
              <p className="mt-6 flex gap-3 text-sm font-bold leading-7 text-[#506783] sm:text-base"><PawPrint className="mt-1 shrink-0 text-[#398ee4]" size={22} aria-hidden="true" />{language === "ja" ? direction === "outbound" ? "渡航先の検疫準備から国内輸送、航空輸送まで、出発に必要な流れを一貫してサポートします。" : "日本の動物検疫準備から航空輸送、到着後の国内輸送まで、帰国・入国をサポートします。" : direction === "outbound" ? "Support from destination quarantine preparation and domestic pickup through international air transport." : "Support for Japan quarantine preparation, air transport, arrival, and onward domestic delivery."}</p>
            </div>
          </div>
        </div>
      </section>

      <section id="guide" className="bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[1100px]">
          <div className="text-center"><p className="text-xl font-bold tracking-[0.14em] text-[#398ee4] sm:text-2xl">{text.guideEyebrow}</p><h2 className="mt-4 text-3xl font-bold sm:text-4xl">{page.breadcrumb}</h2></div>
          <ol className="mt-12 grid gap-4 md:grid-cols-2">
            {page.steps.map(([title, description], index) => (
              <li key={title} className="flex gap-4 rounded-3xl border border-[#c7ddf1] bg-white p-6 shadow-[0_12px_35px_rgba(7,50,115,0.06)]">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#073273] text-sm font-bold text-white">{String(index + 1).padStart(2, "0")}</span>
                <div><h3 className="text-lg font-bold leading-7">{title}</h3><p className="mt-2 text-sm font-medium leading-7 text-[#506783] sm:text-base">{description}</p></div>
              </li>
            ))}
          </ol>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {[[text.period, text.periodText], [text.price, text.priceText]].map(([title, description], index) => (
              <div key={title} className="rounded-3xl bg-[#073273] p-6 text-white"><div className="flex items-center gap-3">{index === 0 ? <CalendarDays className="text-[#8dcbff]" aria-hidden="true" /> : <Plane className="text-[#8dcbff]" aria-hidden="true" />}<h3 className="text-xl font-bold">{title}</h3></div><p className="mt-3 text-sm font-medium leading-7 text-white/75 sm:text-base">{description}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-white px-5 py-16 sm:px-8 sm:py-20 lg:px-12 lg:py-24">
        <div className="mx-auto max-w-[900px]"><h2 className="text-center text-3xl font-bold sm:text-4xl">{text.faq}</h2><div className="mt-10 divide-y divide-[#d9e9f8] border-y border-[#d9e9f8]">{text.faqItems.map(([question, answer]) => <details key={question} className="group"><summary className="flex min-h-20 cursor-pointer list-none items-center justify-between gap-4 py-5 font-bold [&::-webkit-details-marker]:hidden"><span>{question}</span><span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#eaf5ff] text-[#1766ba] transition-transform group-open:rotate-45">＋</span></summary><p className="pb-6 pr-10 text-sm font-medium leading-7 text-[#506783] sm:text-base">{answer}</p></details>)}</div></div>
      </section>
      </> : null}

      <section id="contact" className={`${embedded ? "bg-transparent px-0 py-0" : "bg-[#edf6ff] px-5 py-16 sm:px-8 sm:py-20 lg:px-12"}`}>
        <div className="flightContactCard mx-auto max-w-[1100px] rounded-[2rem] bg-[#073273] px-6 py-12 text-white shadow-[0_20px_55px_rgba(7,50,115,0.2)] sm:px-12 sm:py-16">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/images/flight/paws_logo_white.svg"
              alt="PawsFlight Japan"
              width={260}
              height={105}
              className="-mt-5 mb-1 h-auto w-[300px] sm:-mt-8 sm:mb-0 sm:w-[440px]"
            />
            <h2 className="mt-5 max-w-[850px] whitespace-pre-line text-2xl font-bold leading-tight sm:text-3xl lg:text-4xl">{simpleInquiry ? text.contactTitle : text.finalHeading}</h2>
            <p className="mt-5 max-w-[760px] text-sm font-medium leading-7 text-[#506783] sm:text-base">{simpleInquiry ? text.contactLead : text.finalLead}</p>
          </div>
          <FlightSocial language={language} channels={socialChannels} tone="light" />
          <div className="flightContactPanel mt-9 rounded-[1.75rem] bg-[#f7fbff] p-6 text-[#073273] sm:p-9">
            {simpleInquiry ? (
              <form className="grid gap-5" action="/api/inbox/contact" method="post">
                <input type="hidden" name="lang" value={language} />
                <input type="hidden" name="direction" value={direction} />
                <input className="hidden" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" />
                {query.sent === "1" ? <p className="rounded-2xl bg-[#e5f7ea] p-4 font-bold text-[#216b38]" role="status">{language === "ja" ? "お問い合わせを受け付けました。" : "Your inquiry has been received."}</p> : null}
                {query.error === "1" ? <p className="rounded-2xl bg-[#fff0f0] p-4 font-bold text-[#9b2929]" role="alert">{language === "ja" ? "送信できませんでした。もう一度お試しください。" : "Your inquiry could not be sent. Please try again."}</p> : null}
                <label className="grid gap-2 font-bold"><span>{text.contactName}</span><input name="name" autoComplete="name" required className="min-h-14 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 outline-none focus:border-[#398ee4]" /></label>
                <label className="grid gap-2 font-bold"><span>{text.contactEmail}</span><input type="email" name="email" autoComplete="email" required className="min-h-14 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 outline-none focus:border-[#398ee4]" /></label>
                <label className="grid gap-2 font-bold"><span>{text.contactMessage}</span><textarea name="message" required className="min-h-40 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 py-3 outline-none focus:border-[#398ee4]" /></label>
                <button className="mt-2 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#073273] px-7 font-bold text-white sm:justify-self-center" type="submit">{language === "ja" ? "送信する" : "Send message"}<ArrowRight size={18} aria-hidden="true" /></button>
              </form>
            ) : <>
            <div className="flex items-start gap-4">
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf5ff] text-[#1766ba]"><FileCheck2 size={25} aria-hidden="true" /></span>
              <div><h3 className="text-xl font-bold sm:text-2xl">{text.diagnosis}</h3><p className="mt-2 text-sm font-medium leading-7 text-[#506783] sm:text-base">{text.diagnosisLead}</p></div>
            </div>
            <form className="mt-8 grid gap-5 sm:grid-cols-2" action={standalone ? "/flight/contact" : basePath} method="get">
              <input type="hidden" name="lang" value={language} />
              {standalone ? <input type="hidden" name="direction" value={direction} /> : null}
              <label className="grid gap-2 font-bold"><span>{text.departure}</span><span className="relative"><MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-[#398ee4]" size={19} aria-hidden="true" />{direction === "inbound" ? <select name="departure" defaultValue={diagnosis.departure} required className="min-h-14 w-full appearance-none rounded-2xl border border-[#c9def2] bg-[#f9fcff] pl-12 pr-4 outline-none focus:border-[#398ee4]"><option value="">{text.selectCountry}</option>{countries.map((country) => <option key={country.code} value={country.code}>{country.name[language] || country.name.ja || country.code}</option>)}<option value="other">{text.otherCountry}</option></select> : <input name="departure" defaultValue={diagnosis.departure || (language === "ja" ? "日本" : "Japan")} readOnly className="min-h-14 w-full rounded-2xl border border-[#c9def2] bg-[#f9fcff] pl-12 pr-4 outline-none read-only:text-[#7890ad]" />}</span></label>
              <label className="grid gap-2 font-bold"><span>{text.arrival}</span><span className="relative"><Globe2 className="absolute left-4 top-1/2 -translate-y-1/2 text-[#398ee4]" size={19} aria-hidden="true" />{direction === "outbound" ? <select name="arrival" defaultValue={diagnosis.arrival} required className="min-h-14 w-full appearance-none rounded-2xl border border-[#c9def2] bg-[#f9fcff] pl-12 pr-4 outline-none focus:border-[#398ee4]"><option value="">{text.selectCountry}</option>{countries.map((country) => <option key={country.code} value={country.code}>{country.name[language] || country.name.ja || country.code}</option>)}<option value="other">{text.otherCountry}</option></select> : <input name="arrival" value={language === "ja" ? "日本" : "Japan"} readOnly className="min-h-14 w-full rounded-2xl border border-[#c9def2] bg-[#f9fcff] pl-12 pr-4 text-[#7890ad]" />}</span></label>
              <Link href={swapHref} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[#1766ba] bg-white px-5 font-bold text-[#073273] transition-colors hover:bg-[#eaf5ff] sm:col-span-2 sm:justify-self-center"><ArrowLeftRight size={19} aria-hidden="true" />{language === "ja" ? "出発国と到着国を入れ替える" : "Swap departure and arrival"}</Link>
              <label className="grid gap-2 font-bold"><span>{text.date}</span><span className="relative"><CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 text-[#398ee4]" size={19} aria-hidden="true" /><input type="date" name="date" defaultValue={diagnosis.date} className="min-h-14 w-full rounded-2xl border border-[#c9def2] bg-[#f9fcff] pl-12 pr-4 outline-none focus:border-[#398ee4]" /></span></label>
              <fieldset className="grid gap-3 sm:col-span-2">
                <legend className="font-bold">{text.support}<span className="ml-2 text-xs font-medium text-[#6c829d]">{language === "ja" ? "複数選択できます" : "Select all that apply"}</span></legend>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {supportOptions.map(([value, label]) => (
                    <label key={value} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 font-bold transition-colors has-[:checked]:border-[#1766ba] has-[:checked]:bg-[#eaf5ff]">
                      <input className="h-5 w-5 shrink-0 accent-[#073273]" type="checkbox" name="support" value={value} defaultChecked={diagnosis.support.includes(value)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
              <fieldset className="grid gap-3 sm:col-span-2"><legend className="font-bold">{text.traveller}</legend><div className="grid gap-3 sm:grid-cols-2">{[["pet-only", text.petOnly], ["pet-with-person", text.petWithPerson]].map(([value, label]) => <label key={value} className="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-5 text-lg font-bold has-[:checked]:border-[#1766ba] has-[:checked]:bg-[#eaf5ff]"><input className="h-5 w-5 accent-[#073273]" type="radio" name="traveller" value={value} defaultChecked={diagnosis.traveller === value} required />{label}</label>)}</div><p className="text-sm font-medium leading-6 text-[#506783]">※ {text.petOnlyNote}</p></fieldset>
              <fieldset className="grid gap-3 sm:col-span-2"><legend className="font-bold">{text.crateType}</legend><div className="grid gap-3 sm:grid-cols-2">{[["plastic", text.cratePlastic], ["metal", text.crateMetal], ["wood", text.crateWood], ["other", text.crateOther]].map(([value, label]) => <label key={value} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 font-bold has-[:checked]:border-[#1766ba] has-[:checked]:bg-[#eaf5ff]"><input className="h-5 w-5 accent-[#073273]" type="radio" name="crate" value={value} defaultChecked={diagnosis.crate === value} />{label}</label>)}</div></fieldset>
              <Crates language={language} />
              <label className="grid gap-2 font-bold sm:col-span-2"><span>{text.petDetails}<small className="ml-2 font-medium text-[#6c829d]">{text.petDetailsLead}</small></span><textarea name="petDetails" defaultValue={[diagnosis.petDetails, diagnosis.special].filter(Boolean).join("\n")} className="min-h-28 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 py-3 outline-none focus:border-[#398ee4]" placeholder={text.petDetailsPlaceholder} /></label>
              {direction === "inbound" ? <>
                <fieldset className="grid gap-3 sm:col-span-2"><legend className="font-bold">{text.transportMethod}</legend><div className="grid gap-3 sm:grid-cols-3">{[["cargo", text.cargo], ["checked-baggage", text.checkedBaggage], ["undecided", text.undecided]].map(([value, label]) => <label key={value} className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 font-bold has-[:checked]:border-[#1766ba] has-[:checked]:bg-[#eaf5ff]"><input className="h-5 w-5 accent-[#073273]" type="radio" name="transport" value={value} defaultChecked={diagnosis.transport === value} />{label}</label>)}</div></fieldset>
                {[["transit", text.transit], ["ground", text.domesticTransport]].map(([name, legend]) => <fieldset key={name} className="grid gap-3 sm:col-span-2"><legend className="font-bold"><span className="inline-flex items-center gap-2">{legend}{name === "transit" ? <details className="relative inline-block"><summary className="grid h-7 w-7 cursor-pointer list-none place-items-center rounded-full border border-[#1766ba] bg-white text-sm font-bold text-[#1766ba] [&::-webkit-details-marker]:hidden" aria-label={text.transitHelp}>?</summary><p className="absolute left-0 top-9 z-10 w-[min(78vw,25rem)] rounded-2xl border border-[#c9def2] bg-white p-4 text-sm font-medium leading-6 text-[#506783] shadow-xl">{text.transitHelp}</p></details> : null}</span></legend>{name === "ground" ? <p className="text-sm font-medium leading-6 text-[#506783]">{text.domesticTransportHelp}</p> : null}<div className="grid gap-2">{[["yes", text.needed], ["no", text.notNeeded], ["unknown", text.unknown]].map(([value, label]) => <label key={value} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-2xl border border-[#c9def2] bg-[#f9fcff] px-4 font-bold has-[:checked]:border-[#1766ba] has-[:checked]:bg-[#eaf5ff]"><input className="h-5 w-5 accent-[#073273]" type="radio" name={name} value={value} defaultChecked={diagnosis[name as "transit" | "ground"] === value} />{label}</label>)}</div></fieldset>)}
                <fieldset className="grid gap-3 sm:col-span-2"><legend className="font-bold">{text.destinationAddress}</legend><Address language={language} initialValue={diagnosis.address} namePrefix="destination" variant="flight" /></fieldset>
              </> : null}
              <button className="mt-2 inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-[#073273] px-7 font-bold text-white sm:col-span-2 sm:justify-self-center" type="submit">{text.diagnosisAction}<ArrowRight size={18} aria-hidden="true" /></button>
            </form>
            {hasDiagnosis ? (
              <div className="mt-8 rounded-3xl bg-[#edf6ff] p-6 sm:p-8" aria-live="polite">
                <h3 className="text-xl font-bold sm:text-2xl">{text.resultTitle}</h3>
                <p className="mt-3 font-medium leading-7 text-[#506783]">{text.resultLead}</p>
                <ul className="mt-5 grid gap-3 sm:grid-cols-3">
                  {text.resultItems.map((item) => <li key={item} className="flex items-start gap-2 rounded-2xl bg-white p-4 text-sm font-bold leading-6"><CheckCircle2 className="mt-0.5 shrink-0 text-[#398ee4]" size={19} aria-hidden="true" />{item}</li>)}
                </ul>
              </div>
            ) : null}
            </>}
          </div>
        </div>
      </section>

      {!embedded ? <footer className="bg-[#073273] px-5 py-10 text-white sm:px-8 sm:py-12">
        <div className="mx-auto max-w-[1240px] text-center"><nav className="flex flex-wrap justify-center gap-x-5 gap-y-3 text-xs font-bold text-white/80 sm:text-sm" aria-label={language === "ja" ? "サイトマップ" : "Sitemap"}>{["terms", "privacy", "cancellation", "legal"].map((slug, index) => <Link key={slug} className="hover:text-white" href={`/flight/${slug}?lang=${language}`}>{text.footerLegal[index]}</Link>)}<Link className="hover:text-white" href={`/flight/contact?lang=${language}&form=inquiry`}>{text.footerContact}</Link></nav><div className="mt-5 flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-xs font-medium text-white/65 sm:text-sm"><span className="font-bold text-white/80">{text.footerServices}</span><a className="hover:text-white" href="https://www.pet-taxi.tokyo/">{text.footerServiceLinks[0]}</a><a className="hover:text-white" href="https://pet-taxi-airport.com/">{text.footerServiceLinks[1]}</a></div><FlightSocial language={language} channels={socialChannels} tone="light" /><p className="mt-7 text-xs font-medium tracking-[0.04em] text-white/75 sm:text-sm">{copyrightText}</p></div>
      </footer> : null}
      {!embedded ? <BackToTop label={text.backToTop} /> : null}
    </Root>
  );
}
