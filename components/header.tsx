"use client";

import { Bell, Check, ChevronDown, Globe2, Mail, UserRound } from "lucide-react";
import Image from "next/image";
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
      const iosStandalone = (window.navigator as Navigator & { standalone?: boolean })
        .standalone === true;
      setIsPwa(displayMode.matches || iosStandalone);
    };

    updateDisplayMode();
    displayMode.addEventListener("change", updateDisplayMode);
    return () => displayMode.removeEventListener("change", updateDisplayMode);
  }, []);

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
            <span className="headerPageName">
              {getTranslation({ ja: "ホーム", en: "Home" }, language)}
            </span>
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
                className="headerIconButton"
                type="button"
                aria-label="Notifications"
              >
                <Bell aria-hidden="true" />
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
