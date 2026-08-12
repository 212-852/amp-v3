export const supportedLanguages = ["ja", "en"] as const;

export type Language = (typeof supportedLanguages)[number];

export type Translation = Readonly<Record<Language, string>>;

export const languageNames: Readonly<Record<Language, string>> = {
  ja: "日本語",
  en: "English",
};

export const DEFAULT_LANGUAGE: Language = "en";
export const LANGUAGE_STORAGE_KEY = "pet_taxi_language";

export function isSupportedLanguage(value: unknown): value is Language {
  return supportedLanguages.includes(value as Language);
}

export function detectLanguage(
  browserLanguages: readonly string[],
): Language {
  const primaryLanguage = browserLanguages[0]?.toLowerCase();

  return primaryLanguage?.startsWith("ja") ? "ja" : DEFAULT_LANGUAGE;
}

export function resolveLanguage(
  savedLanguage: unknown,
  browserLanguages: readonly string[],
): Language {
  return isSupportedLanguage(savedLanguage)
    ? savedLanguage
    : detectLanguage(browserLanguages);
}

export function getTranslation(
  translation: Translation,
  language: Language,
): string {
  return translation[language];
}

export function getNextLanguage(language: Language): Language {
  const currentIndex = supportedLanguages.indexOf(language);

  return supportedLanguages[(currentIndex + 1) % supportedLanguages.length];
}
