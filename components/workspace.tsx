"use client";

import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import { Bell, Building2, CalendarDays, ChevronLeft, ClipboardList, Home, MessageCircle, Settings, Truck, UsersRound } from "lucide-react";

import type { NavigationGroup, PortalRole } from "@/lib/navigation/common";
import { navigationDispatcher } from "@/lib/navigation/dispatcher";

const icons = { home: Home, chat: MessageCircle, bell: Bell, settings: Settings, calendar: CalendarDays, truck: Truck, users: UsersRound, building: Building2, clipboard: ClipboardList };

type WorkspaceProps = { role: PortalRole; children: ReactNode };

export function Workspace({ role, children }: WorkspaceProps) {
  const groups = useMemo(() => navigationDispatcher(role), [role]);
  const [groupId, setGroupId] = useState("home");
  const [pageId, setPageId] = useState("overview");
  const [level, setLevel] = useState(0);
  const group = groups.find((item) => item.id === groupId) ?? groups[0];
  const page = group.pages.find((item) => item.id === pageId) ?? group.pages[0];
  const showHome = group.id === "home" && page.id === "overview";

  function selectGroup(item: NavigationGroup) {
    setGroupId(item.id);
    setPageId(item.pages[0].id);
    setLevel(1);
  }

  return (
    <section className="portalWorkspace" data-level={level}>
      <div className="workspaceTrail" aria-label="現在位置">
        <button type="button" onClick={() => setLevel(0)}>{group.label}</button>
        <span>›</span>
        <button type="button" onClick={() => setLevel(1)}>{page.label}</button>
      </div>
      <div className="workspaceViewport">
        <div className="workspaceTrack">
          <nav className="workspacePane workspaceGroups" aria-label="大きいメニュー">
            <p className="workspaceHeading">メニュー</p>
            {groups.map((item) => {
              const Icon = icons[item.icon];
              return (
                <button className={item.id === group.id ? "isActive" : undefined} key={item.id} onClick={() => selectGroup(item)} type="button">
                  <Icon aria-hidden="true" /><span>{item.label}</span>
                </button>
              );
            })}
          </nav>
          <nav className="workspacePane workspacePages" aria-label="小さいメニュー">
            <button className="workspaceBack" onClick={() => setLevel(0)} type="button"><ChevronLeft aria-hidden="true" />メニュー</button>
            <p className="workspaceHeading">{group.label}</p>
            {group.pages.map((item) => (
              <button className={item.id === page.id ? "isActive" : undefined} key={item.id} onClick={() => { setPageId(item.id); setLevel(2); }} type="button">
                <span>{item.label}</span><small>{item.description}</small>
              </button>
            ))}
          </nav>
          <div className="workspacePane workspaceDetail">
            <button className="workspaceBack" onClick={() => setLevel(1)} type="button"><ChevronLeft aria-hidden="true" />{group.label}</button>
            {showHome ? children : (
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
