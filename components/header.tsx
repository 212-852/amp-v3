"use client";

import { Bell, Check, ChevronDown, ChevronRight, Globe2, Mail, UserRound } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { useLanguage } from "@/components/language";
import { useLineIdentity } from "@/components/line";
import { Modal } from "@/components/modal";
import { Toast } from "@/components/toast";
import {
  getTranslation,
  type Language,
} from "@/lib/i18n";
import { acquirePushSubscription, isInstalledPwa, releasePushSubscription, type PushMethod } from "@/lib/push";

type SupabaseIdentity = {
  displayName: string;
  pictureUrl: string | null;
  role: string;
  tier: string;
  destination: string;
  loginProvider: "line" | "google" | "email";
  greeting: "welcome" | "welcome_back" | "hello";
  language: Language;
};

type GoogleCredentialResponse = {
  credential?: string;
};

type LineLoginStart = {
  authorizeUrl: string;
  tokenUuid: string;
  claimToken: string;
  expiresAt: string;
};

type LineLoginClaim = {
  status: "pending" | "completed" | "failed" | "invalid";
  identity?: SupabaseIdentity;
};

type NotificationItem = {
  notificationUuid: string;
  kind: "critical" | "booking" | "message" | "service" | "marketing";
  importance: "normal" | "important" | "urgent";
  title: string;
  body: string;
  actionUrl: string | null;
  readAt: string | null;
  createdAt: string;
};

type GoogleIdentity = {
  accounts: {
    id: {
      initialize: (options: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        nonce: string;
        use_fedcm_for_prompt?: boolean;
      }) => void;
      prompt: (callback?: (notification: {
        isNotDisplayed: () => boolean;
        isSkippedMoment: () => boolean;
        getNotDisplayedReason: () => string;
        getSkippedReason: () => string;
      }) => void) => void;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

let googleScriptPromise: Promise<GoogleIdentity> | null = null;

function loadGoogleIdentity(): Promise<GoogleIdentity> {
  if (window.google) return Promise.resolve(window.google);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      'script[src="https://accounts.google.com/gsi/client"]',
    );
    const script = existingScript ?? document.createElement("script");

    const handleLoad = () => {
      if (window.google) {
        resolve(window.google);
      } else {
        googleScriptPromise = null;
        reject(new Error("google_identity_unavailable"));
      }
    };
    const handleError = () => {
      googleScriptPromise = null;
      reject(new Error("google_identity_script_failed"));
    };

    script.addEventListener("load", handleLoad, { once: true });
    script.addEventListener("error", handleError, { once: true });

    if (!existingScript) {
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  });

  return googleScriptPromise;
}

function createNonce() {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hashNonce(nonce: string) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(nonce),
  );
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

export function AppHeader() {
  const pathname = usePathname();
  const { language, languages, setLanguage } = useLanguage();
  const {
    identity,
    isInitializing: isLineInitializing,
    login,
    logout: logoutLine,
    setIdentityLanguage,
  } = useLineIdentity();
  const [supabaseIdentity, setSupabaseIdentity] = useState<SupabaseIdentity | null>(null);
  const [sessionIdentity, setSessionIdentity] = useState<SupabaseIdentity | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notificationTab, setNotificationTab] = useState<"notices" | "settings">("notices");
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationPreferences, setNotificationPreferences] = useState({ primary: "line" as PushMethod, push: false, line: true, email: false });
  const [notificationChannels, setNotificationChannels] = useState({ line: false, google: false, email: false });
  const [notificationPreferenceSaving, setNotificationPreferenceSaving] = useState<"push" | "line" | "email" | null>(null);
  const [notificationPreferenceMessage, setNotificationPreferenceMessage] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<
    "idle" | "loading" | "ready" | "error"
  >("idle");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [emailStep, setEmailStep] = useState<"address" | "code">("address");
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [isPwa, setIsPwa] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isLineLoading, setIsLineLoading] = useState(false);
  const [isAdminRedirecting, setIsAdminRedirecting] = useState(false);
  const [greeting, setGreeting] = useState<string | null>(null);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const [isLanguageSaving, setIsLanguageSaving] = useState(false);
  const [languagePosition, setLanguagePosition] = useState({ top: 0, left: 0 });
  const supabaseResolved = useRef(false);
  const greetedIdentity = useRef<string | null>(null);
  const languageButtonRef = useRef<HTMLButtonElement | null>(null);
  const languageMenuRef = useRef<HTMLDivElement | null>(null);
  const closeLogin = useCallback(() => {
    setIsLoginOpen(false);
    setShowEmailForm(false);
    setEmailCode("");
    setEmailStep("address");
    setEmailStatus(null);
  }, []);
  const closeNotifications = useCallback(() => setIsNotificationOpen(false), []);
  const closeGreeting = useCallback(() => setGreeting(null), []);
  const activeIdentity = identity ?? supabaseIdentity ?? sessionIdentity;
  const loginProvider = identity
    ? "line"
    : supabaseIdentity?.loginProvider ?? sessionIdentity?.loginProvider ?? null;
  const supabase = useMemo(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    return url && key ? createClient(url, key) : null;
  }, []);

  const loadNotifications = useCallback(async () => {
    setNotificationStatus("loading");

    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });

      if (!response.ok) {
        throw new Error("notification_load_failed");
      }

      const result = (await response.json()) as {
        notifications: NotificationItem[];
        unreadCount: number;
        preferences: { primary: PushMethod; push: boolean; line: boolean; email: boolean };
        channels: { line: boolean; google: boolean; email: boolean };
      };
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
      setNotificationPreferences(result.preferences);
      setNotificationChannels(result.channels);
      setNotificationStatus("ready");
    } catch {
      setNotificationStatus("error");
    }
  }, []);

  const updateNotificationPreference = useCallback(async (key: PushMethod) => {
    if (!activeIdentity || notificationPreferenceSaving) return;

    if (key === "push" && !isPwa) {
      setNotificationPreferenceMessage(getTranslation({ ja: "プッシュ通知を利用するには、アプリをホーム画面へ追加してください", en: "Add the app to your Home Screen to use push notifications" }, language));
      return;
    }

    const previous = notificationPreferences;
    const next = { primary: key, push: key === "push", line: key === "line", email: key === "email" };
    setNotificationPreferences(next);
    setNotificationPreferenceSaving(key);

    try {
      const subscription = key === "push" ? (await acquirePushSubscription()).toJSON() : undefined;
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ primary: key, subscription }),
      });
      if (!response.ok) throw new Error("notification_preference_update_failed");
      if (key !== "push") await releasePushSubscription().catch(() => undefined);
      setNotificationPreferenceMessage(getTranslation({ ja: "通知設定を保存しました", en: "Notification settings saved" }, language));
    } catch {
      setNotificationPreferences(previous);
      setNotificationPreferenceMessage(getTranslation({ ja: "通知設定を保存できませんでした", en: "Notification settings could not be saved" }, language));
    } finally {
      setNotificationPreferenceSaving(null);
    }
  }, [activeIdentity, isPwa, language, notificationPreferenceSaving, notificationPreferences]);

  const openNotifications = useCallback(() => {
    setNotificationTab("notices");
    setIsNotificationOpen(true);

    if (activeIdentity) {
      void loadNotifications();
    }
  }, [activeIdentity, loadNotifications]);

  const markNotificationAsRead = useCallback(
    async (notification: NotificationItem) => {
      if (!notification.readAt) {
        const readAt = new Date().toISOString();
        setNotifications((current) =>
          current.map((item) =>
            item.notificationUuid === notification.notificationUuid
              ? { ...item, readAt }
              : item,
          ),
        );
        setUnreadCount((current) => Math.max(0, current - 1));

        const response = await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            notificationUuid: notification.notificationUuid,
          }),
        }).catch(() => null);

        if (!response?.ok) {
          void loadNotifications();
          return;
        }
      }

      if (notification.actionUrl) {
        window.location.assign(notification.actionUrl);
      }
    },
    [loadNotifications],
  );

  useEffect(() => {
    if (!activeIdentity?.language) return;

    const timer = window.setTimeout(() => {
      setLanguage(activeIdentity.language);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeIdentity?.language, setLanguage]);

  useEffect(() => {
    if (!isLanguageOpen) return;

    function closeOnOutsideClick(event: PointerEvent) {
      const target = event.target as Node;
      if (
        !languageButtonRef.current?.contains(target) &&
        !languageMenuRef.current?.contains(target)
      ) {
        setIsLanguageOpen(false);
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsLanguageOpen(false);
    }

    function closeOnViewportChange() {
      setIsLanguageOpen(false);
    }

    document.addEventListener("pointerdown", closeOnOutsideClick);
    window.addEventListener("keydown", closeOnEscape);
    window.addEventListener("resize", closeOnViewportChange);
    window.addEventListener("scroll", closeOnViewportChange, true);

    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      window.removeEventListener("keydown", closeOnEscape);
      window.removeEventListener("resize", closeOnViewportChange);
      window.removeEventListener("scroll", closeOnViewportChange, true);
    };
  }, [isLanguageOpen]);

  const toggleLanguageMenu = useCallback(() => {
    if (!isLanguageOpen && languageButtonRef.current) {
      const rect = languageButtonRef.current.getBoundingClientRect();
      const menuWidth = 176;
      setLanguagePosition({
        top: rect.bottom + 8,
        left: Math.max(12, Math.min(rect.right - menuWidth, window.innerWidth - menuWidth - 12)),
      });
    }

    setIsLanguageOpen((current) => !current);
  }, [isLanguageOpen]);

  const selectLanguage = useCallback(
    async (nextLanguage: Language) => {
      if (nextLanguage === language) {
        setIsLanguageOpen(false);
        return;
      }

      setIsLanguageSaving(true);
      setLanguage(nextLanguage);
      setIsLanguageOpen(false);

      try {
        if (activeIdentity) {
          const response = await fetch("/api/session", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ language: nextLanguage }),
          });

          if (!response.ok) throw new Error("language_update_failed");

          setSupabaseIdentity((current) =>
            current ? { ...current, language: nextLanguage } : current,
          );
          setSessionIdentity((current) =>
            current ? { ...current, language: nextLanguage } : current,
          );
          setIdentityLanguage(nextLanguage);
        }
      } catch {
        setLanguage(language);
        setGreeting(
          getTranslation(
            {
              ja: "言語設定を保存できませんでした",
              en: "Language setting could not be saved",
            },
            language,
          ),
        );
      } finally {
        setIsLanguageSaving(false);
      }
    },
    [activeIdentity, language, setIdentityLanguage, setLanguage],
  );

  useEffect(() => {
    const displayMode = window.matchMedia("(display-mode: standalone)");
    const updateDisplayMode = () => {
      setIsPwa(isInstalledPwa());
    };

    updateDisplayMode();
    displayMode.addEventListener("change", updateDisplayMode);
    return () => displayMode.removeEventListener("change", updateDisplayMode);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (activeIdentity) {
        void loadNotifications();
        return;
      }

      setNotifications([]);
      setUnreadCount(0);
      setNotificationStatus("idle");
    }, 0);

    return () => window.clearTimeout(timer);
  }, [activeIdentity, loadNotifications]);

  useEffect(() => {
    if (!activeIdentity) return;

    const refresh = () => {
      if (document.visibilityState === "visible") {
        void loadNotifications();
      }
    };
    const interval = window.setInterval(refresh, 30_000);
    document.addEventListener("visibilitychange", refresh);

    return () => {
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [activeIdentity, loadNotifications]);

  useEffect(() => {
    void fetch("/api/session", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return null;
        return response.json() as Promise<{ identity: SupabaseIdentity | null }>;
      })
      .then((result) => setSessionIdentity(result?.identity ?? null))
      .catch(() => undefined);

    const url = new URL(window.location.href);
    if (url.searchParams.has("line_error")) {
      window.setTimeout(
        () => setGreeting("LINEログインを完了できませんでした"),
        0,
      );
      url.searchParams.delete("line_error");
      window.history.replaceState({}, "", `${url.pathname}${url.search}`);
    }
  }, []);

  const reportGoogleFailure = useCallback(async (reason: string) => {
    await fetch("/api/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fail", reason }),
    }).catch(() => undefined);
  }, []);

  const reportEmailFailure = useCallback(async (reason: string) => {
    await fetch("/api/email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "fail", reason }),
    }).catch(() => undefined);
  }, []);

  const resolveSupabaseIdentity = useCallback(
    async (accessToken: string, provider: "google" | "email") => {
      if (supabaseResolved.current) return;
      supabaseResolved.current = true;

      const response = await fetch(`/api/${provider}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resolve", accessToken }),
      });

      if (!response.ok) {
        supabaseResolved.current = false;
        throw new Error(`${provider}_identity_resolution_failed`);
      }

      const result = (await response.json()) as SupabaseIdentity;
      setSupabaseIdentity(result);
      window.history.replaceState({}, "", window.location.pathname);
    },
    [],
  );

  useEffect(() => {
    if (!supabase) return;

    const errorCode = new URLSearchParams(window.location.search).get("error");
    if (errorCode) {
      void reportGoogleFailure(errorCode);
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      if (error) {
        void reportGoogleFailure("session_read_failed");
      } else if (data.session?.access_token) {
        const provider = data.session.user.app_metadata.provider;
        const loginType = provider === "email" ? "email" : "google";
        void resolveSupabaseIdentity(data.session.access_token, loginType).catch((reason) => {
          const report = loginType === "email" ? reportEmailFailure : reportGoogleFailure;
          void report(
            reason instanceof Error ? reason.message : "identity_resolution_failed",
          );
        });
      }
    });
  }, [reportEmailFailure, reportGoogleFailure, resolveSupabaseIdentity, supabase]);

  useEffect(() => {
    if (!activeIdentity) return;

    if (activeIdentity.role === "admin") {
      const destination =
        window.location.hostname === "localhost" ? "/main/admin" : "/admin";

      if (window.location.pathname !== destination) {
        const statusTimer = window.setTimeout(() => {
          setIsAdminRedirecting(true);
        }, 0);
        const redirectTimer = window.setTimeout(() => {
          window.location.replace(destination);
        }, 850);

        return () => {
          window.clearTimeout(statusTimer);
          window.clearTimeout(redirectTimer);
        };
      }
    }

    const key = `${activeIdentity.loginProvider}:${activeIdentity.displayName}:${activeIdentity.greeting}`;
    if (greetedIdentity.current === key) return;
    greetedIdentity.current = key;
    const prefix = activeIdentity.greeting === "welcome"
      ? "ようこそ"
      : activeIdentity.greeting === "welcome_back"
        ? "おかえりなさい"
        : "こんにちは";
    setGreeting(`${prefix}、${activeIdentity.displayName}さん`);
  }, [activeIdentity]);

  const loginWithGoogle = useCallback(async () => {
    if (!supabase) {
      await reportGoogleFailure("supabase_client_configuration_missing");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      await reportGoogleFailure("google_client_id_missing");
      return;
    }

    setIsGoogleLoading(true);

    await fetch("/api/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "start" }),
    }).catch(() => undefined);

    try {
      const google = await loadGoogleIdentity();
      const nonce = createNonce();
      const hashedNonce = await hashNonce(nonce);

      google.accounts.id.initialize({
        client_id: clientId,
        nonce: hashedNonce,
        use_fedcm_for_prompt: true,
        callback: (response) => {
          void (async () => {
            if (!response.credential) {
              await reportGoogleFailure("google_credential_missing");
              setIsGoogleLoading(false);
              return;
            }

            const { data, error } = await supabase.auth.signInWithIdToken({
              provider: "google",
              token: response.credential,
              nonce,
            });

            if (error || !data.session?.access_token) {
              await reportGoogleFailure(error?.code ?? "google_id_token_failed");
              setIsGoogleLoading(false);
              return;
            }

            try {
              await resolveSupabaseIdentity(data.session.access_token, "google");
              closeLogin();
            } catch (reason) {
              await reportGoogleFailure(
                reason instanceof Error
                  ? reason.message
                  : "google_identity_resolution_failed",
              );
            } finally {
              setIsGoogleLoading(false);
            }
          })();
        },
      });

      google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          void reportGoogleFailure(
            `google_prompt_not_displayed:${notification.getNotDisplayedReason()}`,
          );
          setIsGoogleLoading(false);
        } else if (notification.isSkippedMoment()) {
          void reportGoogleFailure(
            `google_prompt_skipped:${notification.getSkippedReason()}`,
          );
          setIsGoogleLoading(false);
        }
      });
    } catch (error) {
      await reportGoogleFailure(
        error instanceof Error ? error.message : "google_identity_start_failed",
      );
      setIsGoogleLoading(false);
    }
  }, [closeLogin, reportGoogleFailure, resolveSupabaseIdentity, supabase]);

  const loginWithLine = useCallback(async () => {
    if (!isPwa) {
      closeLogin();
      await login();
      return;
    }

    setIsLineLoading(true);
    setGreeting("LINEログインを準備しています…");
    const authWindow = window.open("about:blank", "_blank");

    try {
      const response = await fetch("/api/line", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "start",
          returnTo: `${window.location.pathname}${window.location.search}`,
        }),
      });

      if (!response.ok) throw new Error("line_login_start_failed");

      const started = (await response.json()) as LineLoginStart;

      if (authWindow) {
        authWindow.location.href = started.authorizeUrl;
      } else {
        setGreeting("LINEログイン画面を開けませんでした");
        setIsLineLoading(false);
        return;
      }

      setGreeting("LINEで認証してください…");

      for (let attempt = 0; attempt < 120; attempt += 1) {
        await new Promise((resolve) => window.setTimeout(resolve, 1_000));
        const claimResponse = await fetch("/api/line", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "claim",
            tokenUuid: started.tokenUuid,
            claimToken: started.claimToken,
          }),
        });
        const claimed = (await claimResponse.json()) as LineLoginClaim;

        if (claimed.status === "pending") continue;
        if (!claimResponse.ok || claimed.status !== "completed" || !claimed.identity) {
          throw new Error("line_login_claim_failed");
        }

        setSessionIdentity(claimed.identity);
        setGreeting(`おかえりなさい、${claimed.identity.displayName}さん`);
        closeLogin();
        authWindow.close();

        return;
      }

      throw new Error("line_login_timed_out");
    } catch {
      authWindow?.close();
      setGreeting("LINEログインを完了できませんでした");
    } finally {
      setIsLineLoading(false);
    }
  }, [closeLogin, isPwa, login]);

  const loginWithEmail = useCallback(async () => {
    if (!supabase || !email.trim()) return;
    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "start" }),
      }).catch(() => undefined);
      const { error: sendError } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}${window.location.pathname}`,
          shouldCreateUser: true,
        },
      });

      if (sendError) {
        await reportEmailFailure(sendError.code ?? "email_send_failed");
        setEmailStatus("認証メールを送信できませんでした");
        return;
      }

      setEmailStep("code");
      setEmailStatus("メールに届いた8桁の認証コードを入力してください。");
    } finally {
      setIsSendingEmail(false);
    }
  }, [email, reportEmailFailure, supabase]);

  const verifyEmailCode = useCallback(async () => {
    if (!supabase || !email.trim() || emailCode.length !== 8) return;
    setIsSendingEmail(true);
    setEmailStatus(null);

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: emailCode,
        type: "email",
      });

      if (error || !data.session?.access_token) {
        await reportEmailFailure(error?.code ?? "email_otp_verification_failed");
        setEmailStatus("認証コードを確認できませんでした。もう一度お試しください。");
        return;
      }

      setEmailStatus("認証できました。ログインしています…");
      await resolveSupabaseIdentity(data.session.access_token, "email");
      closeLogin();
    } catch {
      await reportEmailFailure("email_otp_resolution_failed");
      setEmailStatus("ログイン処理を完了できませんでした。");
    } finally {
      setIsSendingEmail(false);
    }
  }, [closeLogin, email, emailCode, reportEmailFailure, resolveSupabaseIdentity, supabase]);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);

    try {
      if (loginProvider === "google" && supabase) {
        await supabase.auth.signOut();
        setSupabaseIdentity(null);
        supabaseResolved.current = false;
      } else if (loginProvider === "email" && supabase) {
        await supabase.auth.signOut();
        setSupabaseIdentity(null);
        supabaseResolved.current = false;
      } else if (loginProvider === "line") {
        await logoutLine();
        setSessionIdentity(null);
      }

      const response = await fetch("/api/session", { method: "DELETE" });
      if (!response.ok) {
        throw new Error("session_logout_failed");
      }

      setIsAccountOpen(false);
      window.location.replace(
        window.location.hostname === "localhost" ? "/main" : "/",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }, [loginProvider, logoutLine, supabase]);

  const lineLoginOption = (
    <button
      className="loginProviderButton loginLineButton"
      type="button"
      disabled={isLineLoading}
      onClick={() => void loginWithLine()}
    >
      <span className="lineAppIcon" aria-hidden="true">
        <span>LINE</span>
      </span>
      <strong>{isLineLoading ? getTranslation({ ja: "LINEを開いています…", en: "Opening LINE…" }, language) : getTranslation({ ja: "LINEでログイン", en: "Continue with LINE" }, language)}</strong>
      <span className="loginRecommended">{getTranslation({ ja: "おすすめ", en: "Recommended" }, language)}</span>
    </button>
  );

  const googleLoginOption = (
    <button
      className="loginProviderButton loginGoogleButton"
      type="button"
      disabled={isGoogleLoading}
      onClick={() => void loginWithGoogle()}
    >
      <span className="loginGoogleIcon" aria-hidden="true">G</span>
      <strong>{isGoogleLoading ? getTranslation({ ja: "Googleを開いています…", en: "Opening Google…" }, language) : getTranslation({ ja: "Googleでログイン", en: "Continue with Google" }, language)}</strong>
      <span className="loginSimple">{isPwa ? getTranslation({ ja: "補助", en: "Alternative" }, language) : getTranslation({ ja: "かんたん", en: "Easy" }, language)}</span>
    </button>
  );

  const emailLoginOption = !showEmailForm ? (
    <button
      className="loginProviderButton loginEmailButton"
      type="button"
      onClick={() => setShowEmailForm(true)}
    >
      <Mail aria-hidden="true" />
      <strong>{getTranslation({ ja: "Eメールでログイン", en: "Continue with email" }, language)}</strong>
      <span className="loginPasswordless">{getTranslation({ ja: "コード認証", en: "Code verification" }, language)}</span>
    </button>
  ) : (
    <form
      className="emailLoginForm"
      onSubmit={(event) => {
        event.preventDefault();
        if (emailStep === "code") {
          void verifyEmailCode();
        } else {
          void loginWithEmail();
        }
      }}
    >
      {emailStep === "address" ? (
        <>
          <label htmlFor="loginEmail">{getTranslation({ ja: "メールアドレス", en: "Email address" }, language)}</label>
          <input
            id="loginEmail"
            type="email"
            value={email}
            required
            autoComplete="email"
            inputMode="email"
            placeholder="name@example.com"
            onChange={(event) => setEmail(event.target.value)}
          />
          <button type="submit" disabled={isSendingEmail || !email.trim()}>
            {isSendingEmail ? getTranslation({ ja: "送信中…", en: "Sending…" }, language) : getTranslation({ ja: "認証コードを送信", en: "Send verification code" }, language)}
          </button>
        </>
      ) : (
        <>
          <label htmlFor="loginEmailCode">{getTranslation({ ja: "8桁の認証コード", en: "8-digit verification code" }, language)}</label>
          <input
            id="loginEmailCode"
            className="emailCodeInput"
            type="text"
            value={emailCode}
            required
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={8}
            placeholder="00000000"
            onChange={(event) => setEmailCode(event.target.value.replace(/\D/g, ""))}
          />
          <button type="submit" disabled={isSendingEmail || emailCode.length !== 8}>
            {isSendingEmail ? getTranslation({ ja: "確認中…", en: "Verifying…" }, language) : getTranslation({ ja: "コードを確認してログイン", en: "Verify and sign in" }, language)}
          </button>
          <button
            className="emailBackButton"
            type="button"
            onClick={() => {
              setEmailCode("");
              setEmailStep("address");
              setEmailStatus(null);
            }}
          >
            {getTranslation({ ja: "メールアドレスを変更", en: "Change email address" }, language)}
          </button>
        </>
      )}
      {emailStatus ? <p role="status">{emailStatus}</p> : null}
    </form>
  );

  return (
    <>
      <header className="appHeader">
        <div className="headerContent">
          <div className="headerBrand">
            <strong className="headerLogo">PET TAXI</strong>
            <nav className="headerPageName" aria-label={getTranslation({ ja: "パンくずリスト", en: "Breadcrumb" }, language)}>
              {pathname.endsWith("/company") || pathname.endsWith("/legal") ? (
                <>
                  <Link href={pathname.startsWith("/main") ? "/main" : "/"}>
                    {getTranslation({ ja: "ホーム", en: "Home" }, language)}
                  </Link>
                  <ChevronRight aria-hidden="true" />
                  <span>{pathname.endsWith("/legal")
                    ? getTranslation({ ja: "特定商取引法に基づく表記", en: "Commercial Transactions" }, language)
                    : getTranslation({ ja: "会社概要", en: "Company Profile" }, language)}</span>
                </>
              ) : (
                <span>{getTranslation({ ja: "ホーム", en: "Home" }, language)}</span>
              )}
            </nav>
          </div>

          <div className="headerAccount">
            <nav className="headerActions" aria-label="Account navigation">
              <button
                className={`headerIconButton headerLoginButton${
                  loginProvider === "line" ? " headerLineConnected" : ""
                }${
                  loginProvider === "email" ? " headerEmailConnected" : ""
                }`}
                type="button"
                aria-label={
                  activeIdentity
                    ? getTranslation({ ja: "アカウント接続済み", en: "Account connected" }, language)
                    : getTranslation({ ja: "ログイン方法を開く", en: "Open login options" }, language)
                }
                onClick={() => {
                  if (activeIdentity) {
                    setIsAccountOpen(true);
                  } else {
                    setIsLoginOpen(true);
                  }
                }}
              >
                {loginProvider === "line" ? (
                  <span className="lineAppIcon" aria-hidden="true">
                    <span>LINE</span>
                  </span>
                ) : loginProvider === "google" ? (
                  <span className="googleAppIcon" aria-hidden="true">G</span>
                ) : loginProvider === "email" ? (
                  <span className="headerEmailIcon" aria-hidden="true">
                    <Mail />
                  </span>
                ) : (
                  <span className="japaneseText">
                    {getTranslation({ ja: "ログイン", en: "Login" }, language)}
                  </span>
                )}
              </button>
              <button
                className="headerIconButton headerNotificationButton"
                type="button"
                aria-label={getTranslation(
                  { ja: "お知らせを開く", en: "Open notifications" },
                  language,
                )}
                aria-haspopup="dialog"
                aria-expanded={isNotificationOpen}
                onClick={openNotifications}
              >
                <Bell aria-hidden="true" />
                {unreadCount > 0 ? (
                  <span className="headerNotificationBadge" aria-label={getTranslation(
                    { ja: `未読${unreadCount}件`, en: `${unreadCount} unread` },
                    language,
                  )}>
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                ) : null}
              </button>
              <button
                ref={languageButtonRef}
                className="headerPill headerLanguage"
                type="button"
                aria-label={getTranslation(
                  { ja: "言語を選択", en: "Choose language" },
                  language,
                )}
                aria-haspopup="menu"
                aria-expanded={isLanguageOpen}
                onClick={toggleLanguageMenu}
              >
                <Globe2 aria-hidden="true" />
                <span>{language.toUpperCase()}</span>
                <ChevronDown className="headerLanguageChevron" aria-hidden="true" />
              </button>
            </nav>

            <div className="headerProfile">
              <div className="headerAvatar" aria-label="User avatar">
                {activeIdentity?.pictureUrl ? (
                  <Image
                    src={activeIdentity.pictureUrl}
                    alt=""
                    width={52}
                    height={52}
                    unoptimized
                  />
                ) : (
                  <UserRound aria-hidden="true" />
                )}
              </div>
              <strong>
                {activeIdentity?.displayName ?? getTranslation({ ja: "ゲスト", en: "Guest" }, language)}
              </strong>
            </div>
          </div>

        </div>

        <svg
          className="headerWave"
          viewBox="0 0 1440 150"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 102C195 42 334 13 514 40c199 30 278 101 493 94 161-5 269-43 433-58v74H0Z" />
        </svg>
      </header>

      {isLanguageOpen
        ? createPortal(
            <div
              ref={languageMenuRef}
              className="headerLanguageMenu"
              role="menu"
              aria-label={getTranslation(
                { ja: "表示言語", en: "Display language" },
                language,
              )}
              style={languagePosition}
            >
              {languages.map((option) => (
                <button
                  className={option.code === language ? "isActive" : ""}
                  key={option.code}
                  type="button"
                  role="menuitemradio"
                  aria-checked={option.code === language}
                  disabled={isLanguageSaving}
                  onClick={() => void selectLanguage(option.code)}
                >
                  <span>{option.name}</span>
                  {option.code === language ? <Check aria-hidden="true" /> : null}
                </button>
              ))}
            </div>,
            document.body,
          )
        : null}

      <Modal open={isLoginOpen} label={getTranslation({ ja: "ログイン方法", en: "Sign-in options" }, language)} onClose={closeLogin}>
        <p className="loginModalText">
          {getTranslation({ ja: "ログイン方法を選択してください", en: "Choose how to sign in" }, language)}
        </p>
        {isPwa ? (
          <>
            {lineLoginOption}
            {emailLoginOption}
            <div className="loginSecondaryOptions">
              {googleLoginOption}
            </div>
            <button className="guestContinueButton" type="button" onClick={closeLogin}>
              {getTranslation({ ja: "ゲストのまま利用する", en: "Continue as guest" }, language)}
            </button>
          </>
        ) : (
          <>
            {lineLoginOption}
            {googleLoginOption}
            {emailLoginOption}
          </>
        )}
      </Modal>

      <Modal
        open={isNotificationOpen}
        label={getTranslation({ ja: "お知らせと通知の設定", en: "Notifications and settings" }, language)}
        panelClassName="notificationModalPanel"
        onClose={closeNotifications}
      >
        <div className="notificationTabs" role="tablist" aria-label={getTranslation({ ja: "通知メニュー", en: "Notification menu" }, language)}>
          <button
            className={notificationTab === "notices" ? "isActive" : ""}
            type="button"
            role="tab"
            aria-selected={notificationTab === "notices"}
            onClick={() => setNotificationTab("notices")}
          >
            {getTranslation({ ja: "お知らせ", en: "Notices" }, language)}
            {unreadCount > 0 ? <span>{unreadCount > 99 ? "99+" : unreadCount}</span> : null}
          </button>
          <button
            className={notificationTab === "settings" ? "isActive" : ""}
            type="button"
            role="tab"
            aria-selected={notificationTab === "settings"}
            onClick={() => setNotificationTab("settings")}
          >
            {getTranslation({ ja: "通知の設定", en: "Settings" }, language)}
          </button>
        </div>

        {notificationTab === "notices" ? (
          <div className="notificationPanel" role="tabpanel">
            {!activeIdentity ? (
              <div className="notificationEmpty">
                <Bell aria-hidden="true" />
                <strong>{getTranslation({ ja: "ログインするとお知らせを確認できます", en: "Sign in to view your notifications" }, language)}</strong>
                <button
                  type="button"
                  onClick={() => {
                    closeNotifications();
                    setIsLoginOpen(true);
                  }}
                >
                  {getTranslation({ ja: "ログインする", en: "Sign in" }, language)}
                </button>
              </div>
            ) : notificationStatus === "loading" ? (
              <p className="notificationMessage" role="status">
                {getTranslation({ ja: "お知らせを読み込んでいます…", en: "Loading notifications…" }, language)}
              </p>
            ) : notificationStatus === "error" ? (
              <div className="notificationEmpty">
                <strong>{getTranslation({ ja: "お知らせを読み込めませんでした", en: "Notifications could not be loaded" }, language)}</strong>
                <button type="button" onClick={() => void loadNotifications()}>
                  {getTranslation({ ja: "もう一度試す", en: "Try again" }, language)}
                </button>
              </div>
            ) : notifications.length === 0 ? (
              <div className="notificationEmpty">
                <Bell aria-hidden="true" />
                <strong>{getTranslation({ ja: "新しいお知らせはありません", en: "You are all caught up" }, language)}</strong>
              </div>
            ) : (
              <ul className="notificationList">
                {notifications.map((notification) => (
                  <li key={notification.notificationUuid}>
                    <button
                      className={notification.readAt ? "" : "isUnread"}
                      type="button"
                      onClick={() => void markNotificationAsRead(notification)}
                    >
                      <span className="notificationItemTopline">
                        <strong>{notification.title}</strong>
                        {!notification.readAt ? <i aria-label={getTranslation({ ja: "未読", en: "Unread" }, language)} /> : null}
                      </span>
                      <span>{notification.body}</span>
                      <time dateTime={notification.createdAt}>
                        {new Intl.DateTimeFormat(language === "ja" ? "ja-JP" : "en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }).format(new Date(notification.createdAt))}
                      </time>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="notificationSettings" role="tabpanel">
            <div className="notificationSettingCard">
              <span className="notificationSettingIcon"><Bell aria-hidden="true" /></span>
              <span className="notificationSettingCopy">
                <strong>{getTranslation({ ja: "PWAプッシュ通知", en: "PWA push notifications" }, language)}</strong>
                <small>
                  {isPwa
                    ? getTranslation({ ja: "PWAとして使用しています", en: "Currently using the PWA" }, language)
                    : getTranslation({ ja: "ホーム画面へ追加すると利用できます", en: "Add this app to your Home Screen to use push" }, language)}
                </small>
              </span>
              <button className="notificationToggle" type="button" role="switch" aria-checked={isPwa && notificationPreferences.push} aria-disabled={!isPwa || !activeIdentity} disabled={!activeIdentity || notificationPreferenceSaving !== null} onClick={() => void updateNotificationPreference("push")}>
                <span aria-hidden="true" />
              </button>
            </div>
            {notificationChannels.line ? <div className="notificationSettingCard">
              <span className="notificationSettingIcon notificationLineIcon"><span>LINE</span></span>
              <span className="notificationSettingCopy">
                <strong>{getTranslation({ ja: "LINE通知", en: "LINE notifications" }, language)}</strong>
                <small>{getTranslation({ ja: "LINE連携中のアカウントへ通知します", en: "Notify your linked LINE account" }, language)}</small>
              </span>
              <button className="notificationToggle" type="button" role="switch" aria-checked={notificationPreferences.line} disabled={!activeIdentity || notificationPreferenceSaving !== null} onClick={() => void updateNotificationPreference("line")}>
                <span aria-hidden="true" />
              </button>
            </div> : null}
            {notificationChannels.google || notificationChannels.email ? <div className="notificationSettingCard">
              <span className="notificationSettingIcon"><Mail aria-hidden="true" /></span>
              <span className="notificationSettingCopy">
                <strong>{notificationChannels.google ? "Google メール通知" : getTranslation({ ja: "メール通知", en: "Email notifications" }, language)}</strong>
                <small>{getTranslation({ ja: "連携しているメールアドレスへ通知します", en: "Notify your linked email address" }, language)}</small>
              </span>
              <button className="notificationToggle" type="button" role="switch" aria-checked={notificationPreferences.email} disabled={!activeIdentity || notificationPreferenceSaving !== null} onClick={() => void updateNotificationPreference("email")}><span aria-hidden="true" /></button>
            </div> : null}
            {!activeIdentity ? <p>{getTranslation({ ja: "ログインすると通知方法を設定できます", en: "Sign in to choose notification methods" }, language)}</p> : null}
          </div>
        )}
      </Modal>

      <Toast message={notificationPreferenceMessage} onClose={() => setNotificationPreferenceMessage(null)} />

      <Modal
        open={isAccountOpen}
        label={getTranslation({ ja: "アカウント情報", en: "Account information" }, language)}
        onClose={() => setIsAccountOpen(false)}
      >
        <div className="accountModal">
          <div className="accountProviderIcon" aria-hidden="true">
            {loginProvider === "line" ? (
              <span className="lineAppIcon"><span>LINE</span></span>
            ) : loginProvider === "google" ? (
              <span className="googleAppIcon">G</span>
            ) : (
              <Mail aria-hidden="true" />
            )}
          </div>
          <strong className="accountProviderName">
            {loginProvider === "line"
              ? getTranslation({ ja: "LINEでログイン中", en: "Signed in with LINE" }, language)
              : loginProvider === "google"
                ? getTranslation({ ja: "Googleでログイン中", en: "Signed in with Google" }, language)
                : getTranslation({ ja: "Eメールでログイン中", en: "Signed in with email" }, language)}
          </strong>
          <dl className="accountDetails">
            <div><dt>{getTranslation({ ja: "表示名", en: "Display name" }, language)}</dt><dd>{activeIdentity?.displayName}</dd></div>
          </dl>
          <button
            className="accountLogoutButton"
            type="button"
            disabled={isLoggingOut}
            onClick={() => void logout()}
          >
            {isLoggingOut ? getTranslation({ ja: "ログアウト中…", en: "Signing out…" }, language) : getTranslation({ ja: "ログアウト", en: "Sign out" }, language)}
          </button>
        </div>
      </Modal>

      <Toast
        message={
          isLineInitializing
            ? getTranslation({ ja: "LINEとの接続を確認しています…", en: "Checking the LINE connection…" }, language)
            : isAdminRedirecting
              ? getTranslation({ ja: "管理画面を準備しています…", en: "Preparing the admin page…" }, language)
            : greeting
        }
        onClose={closeGreeting}
        persistent={isLineInitializing || isAdminRedirecting}
      />
    </>
  );
}
