"use client";

import { Bell, Globe2, Mail, UserRound } from "lucide-react";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useLineIdentity } from "@/components/line";
import { Modal } from "@/components/modal";
import { Toast } from "@/components/toast";

type SupabaseIdentity = {
  displayName: string;
  pictureUrl: string | null;
  role: string;
  tier: string;
  destination: string;
  loginProvider: "line" | "google" | "email";
  greeting: "welcome" | "welcome_back" | "hello";
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
  const { identity, login, logout: logoutLine } = useLineIdentity();
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
  const [greeting, setGreeting] = useState<string | null>(null);
  const supabaseResolved = useRef(false);
  const greetedIdentity = useRef<string | null>(null);
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

      if (window.location.pathname !== result.destination) {
        window.location.replace(result.destination);
      }
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

        if (window.location.pathname !== claimed.identity.destination) {
          window.location.replace(claimed.identity.destination);
        }
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
      <strong>{isLineLoading ? "LINEを開いています…" : "LINEでログイン"}</strong>
      <span className="loginRecommended">おすすめ</span>
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
      <strong>{isGoogleLoading ? "Googleを開いています…" : "Googleでログイン"}</strong>
      <span className="loginSimple">{isPwa ? "補助" : "かんたん"}</span>
    </button>
  );

  const emailLoginOption = !showEmailForm ? (
    <button
      className="loginProviderButton loginEmailButton"
      type="button"
      onClick={() => setShowEmailForm(true)}
    >
      <Mail aria-hidden="true" />
      <strong>Eメールでログイン</strong>
      <span className="loginPasswordless">コード認証</span>
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
          <label htmlFor="loginEmail">メールアドレス</label>
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
            {isSendingEmail ? "送信中…" : "認証コードを送信"}
          </button>
        </>
      ) : (
        <>
          <label htmlFor="loginEmailCode">8桁の認証コード</label>
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
            {isSendingEmail ? "確認中…" : "コードを確認してログイン"}
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
            メールアドレスを変更
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
            <span className="headerPageName">Home</span>
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
                  activeIdentity ? "Account connected" : "Open login options"
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
                  <span className="japaneseText">ログイン</span>
                )}
              </button>
              <button
                className="headerIconButton"
                type="button"
                aria-label="Notifications"
              >
                <Bell aria-hidden="true" />
              </button>
              <button className="headerPill headerLanguage" type="button">
                <Globe2 aria-hidden="true" />
                <span>EN</span>
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
              <strong>{activeIdentity?.displayName ?? "Guest"}</strong>
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

      <Modal open={isLoginOpen} label="ログイン方法" onClose={closeLogin}>
        <p className="loginModalText">
          ログイン方法を選択してください
        </p>
        {isPwa ? (
          <>
            {lineLoginOption}
            {emailLoginOption}
            <div className="loginSecondaryOptions">
              {googleLoginOption}
            </div>
            <button className="guestContinueButton" type="button" onClick={closeLogin}>
              ゲストのまま利用する
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
        label="アカウント情報"
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
              ? "LINEでログイン中"
              : loginProvider === "google"
                ? "Googleでログイン中"
                : "Eメールでログイン中"}
          </strong>
          <dl className="accountDetails">
            <div><dt>表示名</dt><dd>{activeIdentity?.displayName}</dd></div>
          </dl>
          <button
            className="accountLogoutButton"
            type="button"
            disabled={isLoggingOut}
            onClick={() => void logout()}
          >
            {isLoggingOut ? "ログアウト中…" : "ログアウト"}
          </button>
        </div>
      </Modal>

      <Toast message={greeting} onClose={closeGreeting} />
    </>
  );
}
