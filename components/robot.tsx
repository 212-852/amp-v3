"use client";

import {
  Bell,
  CircleUserRound,
  Inbox,
  Menu,
  MessageCircle,
  Send,
  Settings,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import { Modal } from "@/components/modal";
import { Workspace } from "@/components/workspace";
import { navigationDispatcher } from "@/lib/navigation/dispatcher";
import {
  getRobotProfile,
  robotDispatcher,
} from "@/lib/robot/dispatcher";
import type { RobotRole } from "@/lib/robot/common";
import { getTranslation, type Language } from "@/lib/i18n";

type PortalToolbarProps = {
  displayName: string;
  pictureUrl?: string | null;
  chatMode: "icon" | "toggle";
  inboxHref?: string;
  language?: Language;
  profileEditable?: boolean;
  role?: RobotRole;
  tier?: string;
};

type ToolbarNotification = {
  notificationUuid: string;
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

export function PortalToolbar({
  displayName,
  pictureUrl,
  chatMode,
  inboxHref,
  language = "ja",
  profileEditable = false,
  role,
  tier,
}: PortalToolbarProps) {
  const router = useRouter();
  const [isChatEnabled, setIsChatEnabled] = useState(true);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<"notices" | "settings">("notices");
  const [notifications, setNotifications] = useState<ToolbarNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationStatus, setNotificationStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [notificationPreferences, setNotificationPreferences] = useState({ push: true, line: true });
  const [notificationSaving, setNotificationSaving] = useState(false);
  const [currentDisplayName, setCurrentDisplayName] = useState(displayName);
  const [profileName, setProfileName] = useState(displayName);
  const [profileLanguage, setProfileLanguage] = useState<Language>(language);
  const [profileStatus, setProfileStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const profileText = {
    title: getTranslation({ ja: "プロフィール編集", en: "Edit profile" }, language),
    intro: getTranslation({ ja: "社内や顧客とのチャットで表示する名前を設定します。", en: "Set the name shown in team and customer chats." }, language),
    nickname: getTranslation({ ja: "ニックネーム", en: "Nickname" }, language),
    nicknameHelp: getTranslation({ ja: "従業員同士の会話や、顧客とのチャットに表示されます。", en: "Shown in conversations with staff and customers." }, language),
    language: getTranslation({ ja: "表示言語", en: "Display language" }, language),
    save: getTranslation({ ja: "保存する", en: "Save" }, language),
    saving: getTranslation({ ja: "保存中…", en: "Saving…" }, language),
    saved: getTranslation({ ja: "保存しました", en: "Saved" }, language),
    error: getTranslation({ ja: "保存できませんでした", en: "Could not save" }, language),
  };
  const managementGroups = useMemo(
    () => role ? navigationDispatcher(role).filter((item) => item.id !== "home") : [],
    [role],
  );

  const loadNotifications = useCallback(async () => {
    setNotificationStatus("loading");
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (!response.ok) throw new Error("notification_load_failed");
      const result = await response.json() as {
        notifications: ToolbarNotification[];
        unreadCount: number;
        preferences: { push: boolean; line: boolean };
      };
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setNotificationPreferences(result.preferences);
      setNotificationStatus("ready");
    } catch {
      setNotificationStatus("error");
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadNotifications(), 0);
    const interval = window.setInterval(() => void loadNotifications(), 30_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
    };
  }, [loadNotifications]);

  async function markNotificationRead(notification: ToolbarNotification) {
    if (!notification.readAt) {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationUuid: notification.notificationUuid }),
      });
      if (response.ok) {
        setNotifications((current) => current.map((item) => item.notificationUuid === notification.notificationUuid ? { ...item, readAt: new Date().toISOString() } : item));
        setUnreadCount((current) => Math.max(0, current - 1));
      }
    }
    if (notification.actionUrl) router.push(notification.actionUrl);
  }

  async function updateNotificationPreference(key: "push" | "line") {
    if (notificationSaving) return;
    const previous = notificationPreferences;
    const next = { ...previous, [key]: !previous[key] };
    setNotificationPreferences(next);
    setNotificationSaving(true);
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ preferences: next }),
      });
      if (!response.ok) throw new Error("notification_save_failed");
    } catch {
      setNotificationPreferences(previous);
    } finally {
      setNotificationSaving(false);
    }
  }

  async function handleProfileSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nickname = profileName.trim();
    if (!nickname || nickname.length > 50) return;
    setProfileStatus("saving");
    try {
      const response = await fetch("/api/session", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resource: "profile", displayName: nickname, language: profileLanguage }),
      });
      if (!response.ok) throw new Error("Profile update failed");
      setCurrentDisplayName(nickname);
      setProfileStatus("saved");
      router.refresh();
    } catch {
      setProfileStatus("error");
    }
  }

  return (
    <>
      <div className="adminIdentity">
        <span className="adminIdentityAvatar">
          {pictureUrl ? (
            <Image
              src={pictureUrl}
              alt=""
              width={52}
              height={52}
              unoptimized
            />
          ) : (
            <CircleUserRound aria-hidden="true" />
          )}
        </span>
        <strong>{currentDisplayName}</strong>
      </div>

      <div className="adminTools">
        <div className="adminToolRow">
          {chatMode === "toggle" ? (
            <button
              className="adminChatToggle"
              type="button"
              aria-label={`Turn chat ${isChatEnabled ? "off" : "on"}`}
              aria-pressed={isChatEnabled}
              onClick={() => setIsChatEnabled((current) => !current)}
            >
              <MessageCircle aria-hidden="true" />
              <span className="adminToggleState">
                {isChatEnabled ? "ON" : "OFF"}
              </span>
            </button>
          ) : (
            <button className="adminToolButton" type="button" aria-label="Chat">
              <MessageCircle aria-hidden="true" />
            </button>
          )}

          <button
            className="adminToolButton"
            type="button"
            aria-label={getTranslation({ ja: "お知らせ", en: "Notifications" }, language)}
            aria-haspopup="dialog"
            aria-expanded={isNotificationOpen}
            onClick={() => {
              setNotificationTab("notices");
              setIsNotificationOpen(true);
              void loadNotifications();
            }}
          >
            <Bell aria-hidden="true" />
            {unreadCount > 0 ? <span className="adminNotificationBadge">{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
          </button>

          <button
            className="adminToolButton"
            type="button"
            aria-label="Settings"
            onClick={() => {
              if (!profileEditable) return;
              setProfileName(currentDisplayName);
              setProfileStatus("idle");
              setIsProfileOpen(true);
            }}
          >
            <Settings aria-hidden="true" />
          </button>
          {role ? (
            <button
              className="adminHeaderMenuButton"
              type="button"
              aria-label="メニューを開く"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu aria-hidden="true" />
              <span>MENU</span>
            </button>
          ) : null}
        </div>

      </div>

      {inboxHref ? (
        <Link
          className="adminInboxButton"
          href={inboxHref}
          aria-label="メッセージを開く"
        >
          <Inbox aria-hidden="true" />
          <span>メッセージ</span>
        </Link>
      ) : null}

      {profileEditable ? (
        <Modal
          open={isProfileOpen}
          onClose={() => setIsProfileOpen(false)}
          label={profileText.title}
          title={profileText.title}
          overlayClassName="adminModalOverlay adminProfileOverlay"
          panelClassName="adminProfileModal"
        >
          <form className="adminProfileForm" onSubmit={handleProfileSubmit}>
            <p>{profileText.intro}</p>
            <label>
              <span>{profileText.nickname}</span>
              <input
                type="text"
                value={profileName}
                maxLength={50}
                autoComplete="nickname"
                onChange={(event) => setProfileName(event.target.value)}
                required
              />
              <small>{profileText.nicknameHelp}</small>
            </label>
            <fieldset>
              <legend>{profileText.language}</legend>
              <div className="adminProfileLanguages">
                {(["ja", "en"] as const).map((option) => (
                  <button
                    key={option}
                    className={profileLanguage === option ? "isActive" : ""}
                    type="button"
                    onClick={() => setProfileLanguage(option)}
                  >
                    {option === "ja" ? "日本語" : "English"}
                  </button>
                ))}
              </div>
            </fieldset>
            <button className="adminProfileSave" type="submit" disabled={profileStatus === "saving" || !profileName.trim()}>
              {profileStatus === "saving" ? profileText.saving : profileText.save}
            </button>
            {profileStatus === "saved" || profileStatus === "error" ? (
              <p className={`adminProfileStatus ${profileStatus}`} role="status">
                {profileStatus === "saved" ? profileText.saved : profileText.error}
              </p>
            ) : null}
          </form>
        </Modal>
      ) : null}

      <Modal
        open={isNotificationOpen}
        onClose={() => setIsNotificationOpen(false)}
        label={getTranslation({ ja: "お知らせと通知の設定", en: "Notifications and settings" }, language)}
        overlayClassName="adminModalOverlay adminNotificationOverlay"
        panelClassName="adminNotificationModal"
      >
        <div className="adminNotificationTabs" role="tablist">
          <button className={notificationTab === "notices" ? "isActive" : ""} type="button" role="tab" aria-selected={notificationTab === "notices"} onClick={() => setNotificationTab("notices")}>
            {getTranslation({ ja: "お知らせ", en: "Notices" }, language)}
            {unreadCount > 0 ? <span>{unreadCount}</span> : null}
          </button>
          <button className={notificationTab === "settings" ? "isActive" : ""} type="button" role="tab" aria-selected={notificationTab === "settings"} onClick={() => setNotificationTab("settings")}>
            {getTranslation({ ja: "設定", en: "Settings" }, language)}
          </button>
        </div>
        {notificationTab === "notices" ? (
          <div className="adminNotificationBody" role="tabpanel">
            {notificationStatus === "loading" ? <p>{getTranslation({ ja: "読み込み中…", en: "Loading…" }, language)}</p> : null}
            {notificationStatus === "error" ? <button type="button" onClick={() => void loadNotifications()}>{getTranslation({ ja: "もう一度試す", en: "Try again" }, language)}</button> : null}
            {notificationStatus === "ready" && notifications.length === 0 ? <p>{getTranslation({ ja: "新しいお知らせはありません", en: "No new notifications" }, language)}</p> : null}
            {notifications.length > 0 ? <ul>{notifications.map((notification) => <li key={notification.notificationUuid}><button className={notification.readAt ? "" : "isUnread"} type="button" onClick={() => void markNotificationRead(notification)}><span><strong>{notification.title}</strong>{!notification.readAt ? <i /> : null}</span><small>{notification.body}</small><time dateTime={notification.createdAt}>{new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(notification.createdAt))}</time></button></li>)}</ul> : null}
          </div>
        ) : (
          <div className="adminNotificationSettings" role="tabpanel">
            <div><span><Bell aria-hidden="true" /></span><p><strong>{getTranslation({ ja: "PWAプッシュ通知", en: "PWA push notifications" }, language)}</strong><small>{getTranslation({ ja: "アプリへ新着を通知します", en: "Notify the installed app" }, language)}</small></p><button type="button" role="switch" aria-checked={notificationPreferences.push} disabled={notificationSaving} onClick={() => void updateNotificationPreference("push")}><i /></button></div>
            <div><span className="adminNotificationLine">LINE</span><p><strong>{getTranslation({ ja: "LINE通知", en: "LINE notifications" }, language)}</strong><small>{getTranslation({ ja: "連携したLINEへ通知します", en: "Notify your linked LINE account" }, language)}</small></p><button type="button" role="switch" aria-checked={notificationPreferences.line} disabled={notificationSaving} onClick={() => void updateNotificationPreference("line")}><i /></button></div>
          </div>
        )}
      </Modal>

      {role ? (
        <Modal
          label="管理メニュー"
          open={isMenuOpen}
          overlayClassName="adminModalOverlay adminMenuOverlay"
          panelClassName="adminMenuModal"
          onClose={() => setIsMenuOpen(false)}
        >
          <div className="adminMenuTitle">
            <Menu aria-hidden="true" />
            <strong>MENU</strong>
          </div>
          <Workspace compact groups={managementGroups} role={role} tier={tier} onNavigate={() => setIsMenuOpen(false)} />
        </Modal>
      ) : null}
    </>
  );
}

export function AdminTrail({ language = "ja" }: { language?: Language }) {
  const pathname = usePathname();
  const isInbox =
    pathname.startsWith("/main/admin/inbox") || pathname.startsWith("/admin/inbox");
  const isPets =
    pathname.startsWith("/main/admin/animals") || pathname.startsWith("/admin/animals") ||
    pathname.startsWith("/main/admin/gallery") || pathname.startsWith("/admin/gallery");
  const currentLabel = isInbox
    ? getTranslation({ ja: "メッセージボックス", en: "Message box" }, language)
    : isPets
      ? getTranslation({ ja: "動物データベース", en: "Animal database" }, language)
        : "";
  const isSubpage = Boolean(currentLabel);

  return (
    <nav className="adminBreadcrumb" aria-label="Breadcrumb">
      {isSubpage ? <Link href="/main/admin">Home</Link> : <strong>Home</strong>}
      {isSubpage ? (
        <>
          <span aria-hidden="true">›</span>
          <strong>{currentLabel}</strong>
        </>
      ) : null}
    </nav>
  );
}

type RobotNoticeProps = {
  role: RobotRole;
  tier?: string;
};

export function RobotNotice({ role }: RobotNoticeProps) {
  const profile = getRobotProfile(role);
  const [isTalkOpen, setIsTalkOpen] = useState(false);
  const [talkMessage, setTalkMessage] = useState("");
  const [talkMessages, setTalkMessages] = useState<
    Array<{ sender: "robot" | "admin"; text: string }>
  >([
    {
      sender: "robot",
      text: profile.greeting,
    },
  ]);

  function handleTalkSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const text = talkMessage.trim();

    if (!text) {
      return;
    }

    setTalkMessages((current) => [
      ...current,
      { sender: "admin", text },
      {
        sender: "robot",
        text: robotDispatcher(role, text),
      },
    ]);
    setTalkMessage("");
  }

  return (
    <div className="adminRobotCall">
      <button
        className="adminRobotButton"
        type="button"
        aria-label="Robo NEKOチャットアシスタントを開く"
        aria-expanded={isTalkOpen}
        onClick={() => setIsTalkOpen(true)}
      >
        <span
          className="adminRobot"
          role="img"
          aria-label="Robo NEKO blinking"
        />
      </button>

      <Modal
        label="Robo NEKOとのトーク"
        open={isTalkOpen}
        overlayClassName="adminTalkOverlay"
        panelClassName="adminTalkPanel"
        title="Robo NEKOと話す"
        onClose={() => setIsTalkOpen(false)}
      >
        <div className="adminTalkRobot" aria-hidden="true">
          <span className="adminRobot" />
        </div>

        <div className="adminTalkMessages" aria-live="polite">
          {talkMessages.map((item, index) => (
            <p
              className={`adminTalkMessage adminTalkMessage${
                item.sender === "robot" ? "Robot" : "Admin"
              }`}
              key={`${item.sender}-${index}`}
            >
              {item.text}
            </p>
          ))}
        </div>

        <form className="adminTalkForm" onSubmit={handleTalkSubmit}>
          <input
            type="text"
            value={talkMessage}
            aria-label="Robo NEKOへのメッセージ"
            placeholder="Robo NEKOに相談する"
            autoComplete="off"
            onChange={(event) => setTalkMessage(event.target.value)}
          />
          <button
            type="submit"
            aria-label="メッセージを送信"
            disabled={!talkMessage.trim()}
          >
            <Send aria-hidden="true" />
          </button>
        </form>
      </Modal>
    </div>
  );
}
