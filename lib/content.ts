import { getTranslation, type Language, type Translation } from "@/lib/i18n";

export type ServiceId = "main" | "tokyo" | "airport" | "corporate" | "flight";

export type CopyrightConfig = {
  startYear: number;
  services: Record<ServiceId, Translation>;
};

export type StructuredServiceConfig = {
  enabled: boolean;
  url: string;
  image: string;
  description: Translation;
  category: Translation;
  area: Translation;
  offering: Translation;
};

export type StructuredConfig = Record<ServiceId, StructuredServiceConfig>;

export type CountryRegion = "northAmerica" | "europe" | "asia" | "oceania" | "other";
export type CountryStatus = "active" | "consult" | "paused";

export type CountryConfig = {
  code: string;
  name: Translation;
  region: CountryRegion;
  status: CountryStatus;
  featured: boolean;
  sortOrder: number;
  note: Translation;
  url: string;
};

export type CountriesConfig = CountryConfig[];

export const defaultCountries: CountriesConfig = [];

const emptyStructuredService: StructuredServiceConfig = {
  enabled: false,
  url: "",
  image: "",
  description: { ja: "", en: "" },
  category: { ja: "", en: "" },
  area: { ja: "", en: "" },
  offering: { ja: "", en: "" },
};

export const defaultStructured: StructuredConfig = {
  main: { ...emptyStructuredService },
  tokyo: { ...emptyStructuredService },
  airport: { ...emptyStructuredService },
  corporate: { ...emptyStructuredService },
  flight: { ...emptyStructuredService },
};

export const defaultCopyright: CopyrightConfig = {
  startYear: 2006,
  services: {
    main: { ja: "PET TAXI", en: "PET TAXI" },
    tokyo: { ja: "ペットタクシー東京", en: "PET TAXI TOKYO" },
    airport: { ja: "PET TAXI AIRPORT", en: "PET TAXI AIRPORT" },
    corporate: { ja: "PET TAXI", en: "PET TAXI" },
    flight: { ja: "PawsFlight Japan", en: "PawsFlight Japan" },
  },
};

export function getCopyright(
  copyright = defaultCopyright,
  companyName: Translation = { ja: "Wan Da Nya Inc.", en: "Wan Da Nya Inc." },
  language: Language = "ja",
  service: ServiceId = "main",
) {
  const currentYear = new Date().getFullYear();
  const years = copyright.startYear < currentYear
    ? `${copyright.startYear}–${currentYear}`
    : String(currentYear);
  const serviceName = getTranslation(copyright.services[service], language);
  const ownerName = getTranslation(companyName, language);
  return `© ${years} ${serviceName} / ${ownerName}`;
}
