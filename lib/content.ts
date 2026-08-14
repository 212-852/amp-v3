import { getTranslation, type Language, type Translation } from "@/lib/i18n";

export type ServiceId = "main" | "tokyo" | "airport" | "corporate" | "flight";

export type CopyrightConfig = {
  startYear: number;
  services: Record<ServiceId, Translation>;
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
