"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Bell, Building2, CalendarDays, ChevronLeft, ClipboardList, Home, LockKeyhole, MessageCircle, Settings, Truck, UsersRound, Wrench } from "lucide-react";

import { canAccessNavigation, type NavigationGroup, type PortalRole } from "@/lib/navigation/common";
import { navigationDispatcher } from "@/lib/navigation/dispatcher";
import { languageNames, supportedLanguages } from "@/lib/i18n";

const icons = { home: Home, chat: MessageCircle, bell: Bell, settings: Settings, wrench: Wrench, calendar: CalendarDays, truck: Truck, users: UsersRound, building: Building2, clipboard: ClipboardList };

type WorkspaceProps = {
  role: PortalRole;
  children?: ReactNode;
  groups?: NavigationGroup[];
  tier?: string;
  compact?: boolean;
  onGroupChange?: (group: NavigationGroup) => void;
};

export function Workspace({ role, children, groups: suppliedGroups, tier, compact = false, onGroupChange }: WorkspaceProps) {
  const groups = useMemo(
    () => suppliedGroups ?? navigationDispatcher(role),
    [role, suppliedGroups],
  );
  const firstGroup = groups[0];
  const [groupId, setGroupId] = useState(firstGroup?.id ?? "");
  const [pageId, setPageId] = useState(firstGroup?.pages[0]?.id ?? "");
  const [level, setLevel] = useState(0);
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const page = group?.pages.find((item) => item.id === pageId) ?? group?.pages[0];
  if (!group || !page) return null;
  const showHome = group.id === "home" && page.id === "overview";
  const showLanguages =
    role === "admin" && group.id === "languages" && page.id === "supported";

  function selectGroup(item: NavigationGroup) {
    if (!canAccessNavigation(item.allowedTiers, tier)) return;
    setGroupId(item.id);
    setPageId(item.pages[0].id);
    setLevel(1);
    onGroupChange?.(item);
  }

  return (
    <section className={`portalWorkspace${compact ? " portalWorkspaceCompact" : ""}`} data-level={level}>
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
          <nav className="workspacePane workspacePages" aria-label="小さいメニュー">
            <button className="workspaceBack" onClick={() => setLevel(0)} type="button"><ChevronLeft aria-hidden="true" />管理メニューへ戻る</button>
            <p className="workspaceHeading">{group.label}</p>
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
          <div className="workspacePane workspaceDetail">
            <button className="workspaceBack" onClick={() => setLevel(1)} type="button"><ChevronLeft aria-hidden="true" />一覧へ戻る</button>
            {showHome ? children : showLanguages ? (
              <section className="workspaceLanguages">
                <header>
                  <h1>対応言語</h1>
                  <p>ウェブアプリで現在利用できる言語です。</p>
                </header>
                <ul>
                  {supportedLanguages.map((language) => (
                    <li key={language}>
                      <span>
                        <strong>{languageNames[language]}</strong>
                        <code>{language}</code>
                      </span>
                      <small>対応中</small>
                    </li>
                  ))}
                </ul>
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
