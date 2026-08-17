"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Building2, CalendarDays, ChevronLeft, ClipboardList, Home, ImageUp, LockKeyhole, MessageCircle, Plus, Settings, Trash2, Truck, UsersRound, Wrench } from "lucide-react";

import { Address, type AddressValue } from "@/components/address";
import { canAccessNavigation, type NavigationGroup, type PortalRole } from "@/lib/navigation/common";
import { navigationDispatcher } from "@/lib/navigation/dispatcher";
import { defaultLanguageOptions, type LanguageOption } from "@/lib/i18n";
import {
  defaultCopyright,
  defaultCountries,
  defaultStructured,
  type CountriesConfig,
  type CountryConfig,
  type CopyrightConfig,
  type ServiceId,
  type StructuredConfig,
} from "@/lib/content";

const icons = { home: Home, chat: MessageCircle, bell: Bell, settings: Settings, wrench: Wrench, calendar: CalendarDays, truck: Truck, users: UsersRound, building: Building2, clipboard: ClipboardList };

type WorkspaceProps = {
  role: PortalRole;
  children?: ReactNode;
  groups?: NavigationGroup[];
  tier?: string;
  compact?: boolean;
  direct?: boolean;
  onGroupChange?: (group: NavigationGroup) => void;
};

type CompanyConfig = {
  name: Record<string, string>;
  address: Omit<AddressValue, "detail"> & { detail: Record<string, string> };
};

const structuredServices: Array<[ServiceId, string]> = [
  ["main", "PET TAXI"],
  ["tokyo", "PET TAXI TOKYO"],
  ["airport", "PET TAXI AIRPORT"],
  ["flight", "PawsFlight Japan"],
  ["corporate", "コーポレート"],
];

export function Workspace({ role, children, groups: suppliedGroups, tier, compact = false, direct = false, onGroupChange }: WorkspaceProps) {
  const groups = useMemo(
    () => suppliedGroups ?? navigationDispatcher(role),
    [role, suppliedGroups],
  );
  const firstGroup = groups[0];
  const [groupId, setGroupId] = useState(firstGroup?.id ?? "");
  const [pageId, setPageId] = useState(firstGroup?.pages[0]?.id ?? "");
  const [level, setLevel] = useState(0);
  const [languages, setLanguages] = useState<readonly LanguageOption[]>(defaultLanguageOptions);
  const [languageCode, setLanguageCode] = useState("");
  const [languageName, setLanguageName] = useState("");
  const [languageError, setLanguageError] = useState("");
  const [company, setCompany] = useState<CompanyConfig>({
    name: { ja: "", en: "" },
    address: { prefectureCode: "", cityCode: "", detail: { ja: "", en: "" } },
  });
  const [companyStatus, setCompanyStatus] = useState("");
  const [companyLanguage, setCompanyLanguage] = useState<"ja" | "en">("ja");
  const [copyright, setCopyright] = useState<CopyrightConfig>(defaultCopyright);
  const [copyrightStatus, setCopyrightStatus] = useState("");
  const [copyrightLanguage, setCopyrightLanguage] = useState<"ja" | "en">("ja");
  const [structuredService, setStructuredService] = useState<ServiceId>("main");
  const [structuredLanguage, setStructuredLanguage] = useState<"ja" | "en">("ja");
  const [structured, setStructured] = useState<StructuredConfig>(defaultStructured);
  const [structuredStatus, setStructuredStatus] = useState("");
  const [structuredUploadStatus, setStructuredUploadStatus] = useState("");
  const [countries, setCountries] = useState<CountriesConfig>(defaultCountries);
  const [countriesStatus, setCountriesStatus] = useState("");
  const [countryLanguage, setCountryLanguage] = useState<"ja" | "en">("ja");
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const page = group?.pages.find((item) => item.id === pageId) ?? group?.pages[0];
  const showLanguages =
    role === "admin" && group?.id === "languages" && page?.id === "supported";
  const showCompany =
    role === "admin" && group?.id === "languages" && page?.id === "company";
  const showCopyright =
    role === "admin" && group?.id === "languages" && page?.id === "copyright";
  const showStructured =
    role === "admin" && group?.id === "languages" && page?.id === "structured";
  const showCountries =
    role === "admin" && group?.id === "languages" && page?.id === "countries";

  const loadLanguages = useCallback(async () => {
    const response = await fetch("/api/session?resource=languages", { cache: "no-store" });
    if (!response.ok) return;
    const result = (await response.json()) as { languages?: LanguageOption[] };
    if (result.languages?.length) setLanguages(result.languages);
  }, []);

  useEffect(() => {
    if (!showLanguages) return;
    const timer = window.setTimeout(() => void loadLanguages(), 0);
    return () => window.clearTimeout(timer);
  }, [loadLanguages, showLanguages]);

  useEffect(() => {
    if (!showCompany) return;
    const controller = new AbortController();
    void fetch("/api/session?resource=company", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<{ company?: CompanyConfig }>)
          : null,
      )
      .then((result) => {
        if (result?.company) setCompany(result.company);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [showCompany]);

  useEffect(() => {
    if (!showCopyright) return;
    const controller = new AbortController();
    void fetch("/api/session?resource=copyright", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<{ copyright?: CopyrightConfig }>)
          : null,
      )
      .then((result) => {
        if (result?.copyright) setCopyright(result.copyright);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [showCopyright]);

  useEffect(() => {
    if (!showStructured) return;
    const controller = new AbortController();
    void fetch("/api/session?resource=structured", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<{ structured?: StructuredConfig }>)
          : null,
      )
      .then((result) => {
        if (result?.structured) setStructured(result.structured);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [showStructured]);

  useEffect(() => {
    if (!showCountries) return;
    const controller = new AbortController();
    void fetch("/api/session?resource=countries", {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) =>
        response.ok
          ? (response.json() as Promise<{ countries?: CountriesConfig }>)
          : null,
      )
      .then((result) => {
        if (result?.countries) setCountries(result.countries);
      })
      .catch(() => undefined);
    return () => controller.abort();
  }, [showCountries]);

  if (!group || !page) return null;
  const showHome = group.id === "home" && page.id === "overview";

  async function addLanguage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLanguageError("");
    const response = await fetch("/api/session", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: languageCode.trim().toLowerCase(), name: languageName.trim() }),
    });
    if (!response.ok) {
      setLanguageError("追加できませんでした。コードの重複を確認してください。");
      return;
    }
    setLanguageCode("");
    setLanguageName("");
    await loadLanguages();
  }

  async function removeLanguage(code: string) {
    setLanguageError("");
    const response = await fetch(`/api/session?resource=language&code=${encodeURIComponent(code)}`, { method: "DELETE" });
    if (!response.ok) {
      setLanguageError("利用中または既定の言語は削除できません。");
      return;
    }
    await loadLanguages();
  }

  async function saveCompany(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCompanyStatus("保存中…");
    const response = await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "company", company }),
    });
    setCompanyStatus(response.ok ? "保存しました" : "保存できませんでした");
  }

  function updateCompanyName(language: "ja" | "en", value: string) {
    setCompany((current) => ({
      ...current,
      name: { ...current.name, [language]: value },
    }));
  }

  async function saveCopyright(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCopyrightStatus("保存中…");
    const response = await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "copyright", copyright }),
    });
    setCopyrightStatus(response.ok ? "保存しました" : "保存できませんでした");
  }

  function updateServiceName(service: ServiceId, language: "ja" | "en", value: string) {
    setCopyright((current) => ({
      ...current,
      services: {
        ...current.services,
        [service]: { ...current.services[service], [language]: value },
      },
    }));
  }

  async function saveStructured(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStructuredStatus("保存中…");
    const response = await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "structured", structured }),
    });
    setStructuredStatus(response.ok ? "保存しました" : "保存できませんでした");
  }

  function updateStructuredShared(
    key: "enabled" | "url" | "image",
    value: boolean | string,
  ) {
    setStructured((current) => ({
      ...current,
      [structuredService]: {
        ...current[structuredService],
        [key]: value,
      },
    }));
  }

  function updateStructuredText(
    key: "description" | "category" | "area" | "offering",
    value: string,
  ) {
    setStructured((current) => ({
      ...current,
      [structuredService]: {
        ...current[structuredService],
        [key]: {
          ...current[structuredService][key],
          [structuredLanguage]: value,
        },
      },
    }));
  }

  async function uploadStructuredImage(file: File | undefined) {
    if (!file) return;
    setStructuredUploadStatus("アップロード中…");
    const formData = new FormData();
    formData.set("service", structuredService);
    formData.set("image", file);
    const response = await fetch("/api/session?resource=structured-image", {
      method: "POST",
      body: formData,
    });
    const result = (await response.json().catch(() => null)) as { url?: string; error?: string } | null;

    if (!response.ok || !result?.url) {
      setStructuredUploadStatus(result?.error ?? "アップロードできませんでした");
      return;
    }

    updateStructuredShared("image", result.url);
    setStructuredUploadStatus("アップロードしました。最後に保存してください");
  }

  async function saveCountries(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setCountriesStatus("保存中…");
    const response = await fetch("/api/session", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resource: "countries", countries }),
    });
    setCountriesStatus(response.ok ? "保存しました" : "保存できませんでした");
  }

  function updateCountry(index: number, update: Partial<CountryConfig>) {
    setCountries((current) => current.map((country, countryIndex) =>
      countryIndex === index ? { ...country, ...update } : country,
    ));
  }

  function updateCountryText(index: number, key: "name" | "note", value: string) {
    setCountries((current) => current.map((country, countryIndex) =>
      countryIndex === index
        ? { ...country, [key]: { ...country[key], [countryLanguage]: value } }
        : country,
    ));
  }

  function addCountry() {
    const nextSortOrder = countries.reduce((maximum, country) => Math.max(maximum, country.sortOrder), 0) + 10;
    setCountries((current) => [...current, {
      code: "",
      name: { ja: "", en: "" },
      region: "other",
      status: "consult",
      featured: false,
      sortOrder: nextSortOrder,
      note: { ja: "", en: "" },
      url: "",
    }]);
  }

  function removeCountry(index: number) {
    setCountries((current) => current.filter((_, countryIndex) => countryIndex !== index));
  }

  function selectGroup(item: NavigationGroup) {
    if (!canAccessNavigation(item.allowedTiers, tier)) return;
    setGroupId(item.id);
    setPageId(item.pages[0].id);
    setLevel(1);
    onGroupChange?.(item);
  }

  return (
    <section className={`portalWorkspace${compact ? " portalWorkspaceCompact" : ""}${direct ? " portalWorkspaceDirect" : ""}`} data-level={level}>
      <div className="workspaceTrail" aria-label="現在位置">
        <button type="button" onClick={() => setLevel(0)}>
          {compact ? "管理メニュー" : group.label}
        </button>
        <span>›</span>
        <button
          type="button"
          aria-current={page.label === group.label ? "page" : undefined}
          onClick={() => setLevel(1)}
        >
          {group.label}
        </button>
        {page.label !== group.label ? (
          <>
            <span>›</span>
            <button type="button" aria-current="page" onClick={() => setLevel(2)}>
              {page.label}
            </button>
          </>
        ) : null}
      </div>
      <div className="workspaceViewport">
        <div className="workspaceTrack">
          <nav className="workspacePane workspaceGroups" aria-label="大きいメニュー">
            <p className="workspaceHeading">メニュー</p>
            {groups.map((item) => {
              const Icon = icons[item.icon];
              const allowed = canAccessNavigation(item.allowedTiers, tier);
              return (
                <button className={item.id === group.id ? "isActive" : undefined} disabled={!allowed} key={item.id} onClick={() => selectGroup(item)} type="button">
                  <Icon aria-hidden="true" /><span>{item.label}</span>
                  {!allowed && <small className="workspaceAccess"><LockKeyhole aria-hidden="true" />owner・coreのみ</small>}
                </button>
              );
            })}
          </nav>
          {!direct ? (
            <nav className="workspacePane workspacePages" aria-label="小さいメニュー">
              <button className="workspaceBack" onClick={() => setLevel(0)} type="button"><ChevronLeft aria-hidden="true" />管理メニューへ戻る</button>
              <p className="workspaceHeading">{group.label}一覧</p>
              {group.pages.map((item) => {
                const allowed = canAccessNavigation(item.allowedTiers, tier);
                return (
                  <button className={item.id === page.id ? "isActive" : undefined} disabled={!allowed} key={item.id} onClick={() => { if (!allowed) return; setPageId(item.id); setLevel(2); }} type="button">
                    <span>{item.label}</span><small>{item.description}</small>
                    {!allowed && <small className="workspaceAccess"><LockKeyhole aria-hidden="true" />owner・coreのみ</small>}
                  </button>
                );
              })}
            </nav>
          ) : null}
          <div className="workspacePane workspaceDetail">
            <button className="workspaceBack" onClick={() => setLevel(direct ? 0 : 1)} type="button"><ChevronLeft aria-hidden="true" />一覧へ戻る</button>
            {showHome ? children : showLanguages ? (
              <section className="workspaceLanguages">
                <header>
                  <h1>対応言語</h1>
                  <p>ウェブアプリで現在利用できる言語です。</p>
                </header>
                <form className="workspaceLanguageForm" onSubmit={addLanguage}>
                  <input aria-label="言語コード" maxLength={20} placeholder="es" required value={languageCode} onChange={(event) => setLanguageCode(event.target.value)} />
                  <input aria-label="表示名" maxLength={60} placeholder="Español" required value={languageName} onChange={(event) => setLanguageName(event.target.value)} />
                  <button type="submit">追加</button>
                </form>
                {languageError ? <p className="workspaceLanguageError" role="alert">{languageError}</p> : null}
                <ul>
                  {languages.map((language) => (
                    <li key={language.code}>
                      <span>
                        <strong>{language.name}</strong>
                        <code>{language.code}</code>
                      </span>
                      <button aria-label={`${language.name}を削除`} disabled={language.code === "ja"} onClick={() => void removeLanguage(language.code)} type="button"><Trash2 aria-hidden="true" /></button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : showCompany ? (
              <section className="workspaceCompany">
                <header>
                  <h1>会社概要</h1>
                  <p>ウェブアプリで共通利用する会社情報です。</p>
                </header>
                <form onSubmit={saveCompany}>
                  <div className="workspaceCompanyTabs" role="tablist" aria-label="編集言語">
                    <button className={companyLanguage === "ja" ? "isActive" : ""} type="button" role="tab" aria-selected={companyLanguage === "ja"} onClick={() => setCompanyLanguage("ja")}>日本語</button>
                    <button className={companyLanguage === "en" ? "isActive" : ""} type="button" role="tab" aria-selected={companyLanguage === "en"} onClick={() => setCompanyLanguage("en")}>English</button>
                  </div>
                  <fieldset>
                    <legend className="srOnly">{companyLanguage === "ja" ? "日本語" : "English"}</legend>
                    <label>{companyLanguage === "ja" ? "会社名" : "Company name"}<input required value={company.name[companyLanguage] ?? ""} onChange={(event) => updateCompanyName(companyLanguage, event.target.value)} /></label>
                    <Address
                      language={companyLanguage}
                      value={{ ...company.address, detail: company.address.detail[companyLanguage] ?? "" }}
                      onChange={(address) => setCompany((current) => ({
                        ...current,
                        address: { ...address, detail: { ...current.address.detail, [companyLanguage]: address.detail } },
                      }))}
                    />
                  </fieldset>
                  <div className="workspaceCompanyActions">
                    <span role="status">{companyStatus}</span>
                    <button type="submit">保存</button>
                  </div>
                </form>
              </section>
            ) : showCopyright ? (
              <section className="workspaceCompany">
                <header>
                  <h1>コピーライト</h1>
                  <p>会社名は会社概要の設定を共通利用します。</p>
                </header>
                <form onSubmit={saveCopyright}>
                  <label>開始年<input min="1900" max={new Date().getFullYear()} required type="number" value={copyright.startYear} onChange={(event) => setCopyright((current) => ({ ...current, startYear: Number(event.target.value) }))} /></label>
                  <div className="workspaceCompanyTabs" role="tablist" aria-label="編集言語">
                    <button className={copyrightLanguage === "ja" ? "isActive" : ""} type="button" role="tab" aria-selected={copyrightLanguage === "ja"} onClick={() => setCopyrightLanguage("ja")}>日本語</button>
                    <button className={copyrightLanguage === "en" ? "isActive" : ""} type="button" role="tab" aria-selected={copyrightLanguage === "en"} onClick={() => setCopyrightLanguage("en")}>English</button>
                  </div>
                  <fieldset>
                    <legend className="srOnly">{copyrightLanguage === "ja" ? "日本語" : "English"}</legend>
                    {([
                      ["main", "PET TAXI"],
                      ["tokyo", "ペットタクシー東京"],
                      ["airport", "PET TAXI AIRPORT"],
                      ["corporate", "コーポレート"],
                      ["flight", "PawsFlight Japan"],
                    ] as Array<[ServiceId, string]>).map(([service, label]) => (
                      <label key={service}>{label}<input required value={copyright.services[service][copyrightLanguage] ?? ""} onChange={(event) => updateServiceName(service, copyrightLanguage, event.target.value)} /></label>
                    ))}
                  </fieldset>
                  <div className="workspaceCompanyActions">
                    <span role="status">{copyrightStatus}</span>
                    <button type="submit">保存</button>
                  </div>
                </form>
              </section>
            ) : showStructured ? (
              <section className="workspaceCompany workspaceStructured">
                <header>
                  <h1>SEO・構造化データ</h1>
                </header>
                <div className="workspaceServiceTabs" role="tablist" aria-label="対象サービス">
                  {structuredServices.map(([service, label]) => (
                    <button
                      className={structuredService === service ? "isActive" : ""}
                      key={service}
                      type="button"
                      role="tab"
                      aria-selected={structuredService === service}
                      onClick={() => setStructuredService(service)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <form onSubmit={saveStructured}>
                  <div className="workspaceStructuredSwitch">
                    <span>JSON-LD</span>
                    <label className="workspaceToggle">
                      <input
                        checked={structured[structuredService].enabled}
                        type="checkbox"
                        role="switch"
                        aria-label="JSON-LDを有効にする"
                        onChange={(event) => updateStructuredShared("enabled", event.target.checked)}
                      />
                      <span className="workspaceToggleTrack" aria-hidden="true">
                        <span className="workspaceToggleThumb" />
                      </span>
                      <span className="workspaceToggleStatus">
                        {structured[structuredService].enabled ? "有効" : "無効"}
                      </span>
                    </label>
                  </div>
                  <label>サイトURL<input type="url" value={structured[structuredService].url} onChange={(event) => updateStructuredShared("url", event.target.value)} /></label>
                  <div className="workspaceStructuredImage">
                    <label>代表画像URL<input type="url" value={structured[structuredService].image} onChange={(event) => updateStructuredShared("image", event.target.value)} /></label>
                    <label className="workspaceImageUpload">
                      <ImageUp size={18} aria-hidden="true" />
                      画像をアップロード
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(event) => {
                          void uploadStructuredImage(event.target.files?.[0]);
                          event.target.value = "";
                        }}
                      />
                    </label>
                    <small>JPEG・PNG・WebP／5MB以下</small>
                    <span role="status">{structuredUploadStatus}</span>
                  </div>
                  <div className="workspaceCompanyTabs" role="tablist" aria-label="編集言語">
                    <button className={structuredLanguage === "ja" ? "isActive" : ""} type="button" role="tab" aria-selected={structuredLanguage === "ja"} onClick={() => setStructuredLanguage("ja")}>日本語</button>
                    <button className={structuredLanguage === "en" ? "isActive" : ""} type="button" role="tab" aria-selected={structuredLanguage === "en"} onClick={() => setStructuredLanguage("en")}>English</button>
                  </div>
                  <fieldset>
                    <legend className="srOnly">{structuredLanguage === "ja" ? "日本語" : "English"}</legend>
                    <label>{structuredLanguage === "ja" ? "サービス説明" : "Service description"}<textarea value={structured[structuredService].description[structuredLanguage] ?? ""} onChange={(event) => updateStructuredText("description", event.target.value)} /></label>
                    <label>{structuredLanguage === "ja" ? "サービス分類" : "Service category"}<input value={structured[structuredService].category[structuredLanguage] ?? ""} onChange={(event) => updateStructuredText("category", event.target.value)} /></label>
                    <label>{structuredLanguage === "ja" ? "対応地域" : "Area served"}<input value={structured[structuredService].area[structuredLanguage] ?? ""} onChange={(event) => updateStructuredText("area", event.target.value)} /></label>
                    <label>{structuredLanguage === "ja" ? "提供内容" : "Service offering"}<textarea value={structured[structuredService].offering[structuredLanguage] ?? ""} onChange={(event) => updateStructuredText("offering", event.target.value)} /></label>
                  </fieldset>
                  <div className="workspaceCompanyActions">
                    <span role="status">{structuredStatus}</span>
                    <button type="submit">保存</button>
                  </div>
                </form>
              </section>
            ) : showCountries ? (
              <section className="workspaceCompany workspaceCountries">
                <header>
                  <h1>対応国</h1>
                  <p>トップ表示、対応状況、地域別一覧をまとめて管理します。</p>
                </header>
                <div className="workspaceCompanyTabs" role="tablist" aria-label="編集言語">
                  <button className={countryLanguage === "ja" ? "isActive" : ""} type="button" role="tab" aria-selected={countryLanguage === "ja"} onClick={() => setCountryLanguage("ja")}>日本語</button>
                  <button className={countryLanguage === "en" ? "isActive" : ""} type="button" role="tab" aria-selected={countryLanguage === "en"} onClick={() => setCountryLanguage("en")}>English</button>
                </div>
                <form onSubmit={saveCountries}>
                  <div className="workspaceCountryList">
                    {countries.map((country, index) => (
                      <fieldset className="workspaceCountryCard" key={index}>
                        <div className="workspaceCountryHeading">
                          <strong>{country.name[countryLanguage] || country.code || `国 ${index + 1}`}</strong>
                          <button type="button" aria-label={`${country.name[countryLanguage] || country.code || "国"}を削除`} onClick={() => removeCountry(index)}><Trash2 aria-hidden="true" /></button>
                        </div>
                        <div className="workspaceCountryGrid">
                          <label>国コード<input maxLength={2} required value={country.code} onChange={(event) => updateCountry(index, { code: event.target.value.toUpperCase() })} /></label>
                          <label>表示順<input min="0" type="number" required value={country.sortOrder} onChange={(event) => updateCountry(index, { sortOrder: Number(event.target.value) })} /></label>
                          <label>{countryLanguage === "ja" ? "国名" : "Country name"}<input required value={country.name[countryLanguage] ?? ""} onChange={(event) => updateCountryText(index, "name", event.target.value)} /></label>
                          <label>地域<select value={country.region} onChange={(event) => updateCountry(index, { region: event.target.value as CountryConfig["region"] })}><option value="northAmerica">北米</option><option value="europe">欧州</option><option value="asia">アジア</option><option value="oceania">オセアニア</option><option value="other">その他</option></select></label>
                          <label>対応状況<select value={country.status} onChange={(event) => updateCountry(index, { status: event.target.value as CountryConfig["status"] })}><option value="active">対応中</option><option value="consult">要相談</option><option value="paused">停止中</option></select></label>
                          <label className="workspaceCountryFeatured"><input type="checkbox" checked={country.featured} onChange={(event) => updateCountry(index, { featured: event.target.checked })} />トップページに表示</label>
                        </div>
                        <label>{countryLanguage === "ja" ? "国別の注意事項" : "Country notes"}<textarea value={country.note[countryLanguage] ?? ""} onChange={(event) => updateCountryText(index, "note", event.target.value)} /></label>
                        <label>詳細ページURL（将来用）<input type="url" value={country.url} onChange={(event) => updateCountry(index, { url: event.target.value })} /></label>
                      </fieldset>
                    ))}
                  </div>
                  <button className="workspaceCountryAdd" type="button" onClick={addCountry}><Plus aria-hidden="true" />国を追加</button>
                  <div className="workspaceCompanyActions">
                    <span role="status">{countriesStatus}</span>
                    <button type="submit">保存</button>
                  </div>
                </form>
              </section>
            ) : (
              <div className="workspacePlaceholder">
                <span>{group.label}</span><h1>{page.label}</h1><p>{page.description}</p><small>このページは準備中です。</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
