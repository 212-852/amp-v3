"use client";

import type { FormEvent, ReactNode } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Bell, Building2, CalendarDays, ChevronLeft, ClipboardList, Home, LockKeyhole, MessageCircle, Settings, Trash2, Truck, UsersRound, Wrench } from "lucide-react";

import { Address, type AddressValue } from "@/components/address";
import { canAccessNavigation, type NavigationGroup, type PortalRole } from "@/lib/navigation/common";
import { navigationDispatcher } from "@/lib/navigation/dispatcher";
import { defaultLanguageOptions, type LanguageOption } from "@/lib/i18n";
import { defaultCopyright, type CopyrightConfig, type ServiceId } from "@/lib/content";

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
  address: AddressValue;
};

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
    address: { prefectureCode: "", cityCode: "", detail: "" },
  });
  const [companyStatus, setCompanyStatus] = useState("");
  const [companyLanguage, setCompanyLanguage] = useState<"ja" | "en">("ja");
  const [copyright, setCopyright] = useState<CopyrightConfig>(defaultCopyright);
  const [copyrightStatus, setCopyrightStatus] = useState("");
  const [copyrightLanguage, setCopyrightLanguage] = useState<"ja" | "en">("ja");
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const page = group?.pages.find((item) => item.id === pageId) ?? group?.pages[0];
  const showLanguages =
    role === "admin" && group?.id === "languages" && page?.id === "supported";
  const showCompany =
    role === "admin" && group?.id === "languages" && page?.id === "company";
  const showCopyright =
    role === "admin" && group?.id === "languages" && page?.id === "copyright";

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
                      value={company.address}
                      onChange={(address) => setCompany((current) => ({ ...current, address }))}
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
