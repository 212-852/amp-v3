"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  DEFAULT_LANGUAGE,
  defaultLanguageOptions,
  LANGUAGE_STORAGE_KEY,
  type Language,
  type LanguageOption,
  resolveLanguage,
} from "@/lib/i18n";
import { defaultCopyright, type CopyrightConfig } from "@/lib/content";

type LanguageContextValue = {
  language: Language;
  languages: readonly LanguageOption[];
  companyName: Record<string, string>;
  copyright: CopyrightConfig;
  refreshLanguages: () => Promise<void>;
  setLanguage: (language: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [languages, setLanguages] = useState<readonly LanguageOption[]>(defaultLanguageOptions);
  const [companyName, setCompanyName] = useState<Record<string, string>>({ ja: "Wan Da Nya Inc.", en: "Wan Da Nya Inc." });
  const [copyright, setCopyright] = useState<CopyrightConfig>(defaultCopyright);

  const refreshLanguages = useCallback(async () => {
    const response = await fetch("/api/session?resource=config", { cache: "no-store" });
    if (!response.ok) return;
    const result = (await response.json()) as {
      languages?: LanguageOption[];
      company?: { name?: Record<string, string> };
      copyright?: CopyrightConfig;
    };
    if (result.languages?.length) setLanguages(result.languages);
    if (result.company?.name) setCompanyName(result.company.name);
    if (result.copyright) setCopyright(result.copyright);
  }, []);

  const setLanguage = useCallback((nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, nextLanguage);
    document.documentElement.lang = nextLanguage;
    document.documentElement.dataset.language = nextLanguage;
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void refreshLanguages(), 0);
    return () => window.clearTimeout(timer);
  }, [refreshLanguages]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const savedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
      const initialLanguage = resolveLanguage(
        savedLanguage,
        window.navigator.languages.length > 0
          ? window.navigator.languages
          : [window.navigator.language],
      );

      setLanguage(initialLanguage);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [setLanguage]);

  const value = useMemo(
    () => ({ language, languages, companyName, copyright, refreshLanguages, setLanguage }),
    [language, languages, companyName, copyright, refreshLanguages, setLanguage],
  );

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error("useLanguage must be used inside LanguageProvider.");
  }

  return context;
}
