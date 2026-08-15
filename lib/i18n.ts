export const supportedLanguages = ["ja", "en"] as const;

export type Language = string;

export type LanguageOption = {
  code: Language;
  name: string;
};

export type Translation = Readonly<Record<string, string>>;

export const languageNames: Readonly<Record<string, string>> = {
  ja: "日本語",
  en: "English",
};

export const DEFAULT_LANGUAGE: Language = "ja";
export const LANGUAGE_STORAGE_KEY = "pet_taxi_language";
export const defaultLanguageOptions: readonly LanguageOption[] =
  supportedLanguages.map((code) => ({ code, name: languageNames[code] }));

export function isLanguageCode(value: unknown): value is Language {
  return typeof value === "string" && /^[a-z]{2,3}(?:-[a-z0-9]{2,8})*$/.test(value);
}

export function isSupportedLanguage(value: unknown): value is Language {
  return supportedLanguages.some((language) => language === value);
}

export function getSourceLanguage(
  language: Language,
): (typeof supportedLanguages)[number] {
  return language === "ja" ? "ja" : "en";
}

export function detectLanguage(
  browserLanguages: readonly string[],
): Language {
  const primaryLanguage = browserLanguages[0]?.toLowerCase();

  return primaryLanguage?.startsWith("ja") ? "ja" : "en";
}

export function resolveLanguage(
  savedLanguage: unknown,
  browserLanguages: readonly string[],
): Language {
  return isLanguageCode(savedLanguage)
    ? savedLanguage
    : detectLanguage(browserLanguages);
}

export function getTranslation(
  translation: Translation,
  language: Language,
): string {
  return (
    translation[language] ??
    translation[DEFAULT_LANGUAGE] ??
    translation.ja ??
    ""
  );
}

export function getNextLanguage(language: Language): Language {
  const currentIndex = supportedLanguages.findIndex((item) => item === language);

  return supportedLanguages[(currentIndex + 1) % supportedLanguages.length];
}
