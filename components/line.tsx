"use client";

import liff from "@line/liff";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type LineIdentity = {
  displayName: string;
  pictureUrl: string | null;
  role: string;
  tier: string;
  destination: string;
  loginProvider: "line";
  greeting: "welcome" | "welcome_back" | "hello";
};

type LineContextValue = {
  identity: LineIdentity | null;
  isInitializing: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
};

const LineContext = createContext<LineContextValue | null>(null);

export function LineProvider({ children }: { children: React.ReactNode }) {
  const [identity, setIdentity] = useState<LineIdentity | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);

  const connect = useCallback(async () => {
    const isLineBrowser = /Line\//i.test(window.navigator.userAgent);

    if (isLineBrowser) {
      setIsInitializing(true);
    }

    if (window.sessionStorage.getItem("line_logout") === "1") {
      setIsInitializing(false);
      return;
    }

    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId) {
      setIsInitializing(false);
      return;
    }

    try {
      await liff.init({ liffId });

      if (!liff.isLoggedIn()) {
        if (isLineBrowser) {
          liff.login({ redirectUri: window.location.href });
          return;
        }

        setIsInitializing(false);
        return;
      }

      const idToken = liff.getIDToken();

      if (!idToken) {
        setIsInitializing(false);
        return;
      }

      const response = await fetch("/api/line", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error("LINE identity connection failed.");
      }

      const result = (await response.json()) as LineIdentity;
      setIdentity(result);
      setIsInitializing(false);

    } catch (error) {
      setIsInitializing(false);
      throw error;
    }
  }, []);

  const login = useCallback(async () => {
    const liffId = process.env.NEXT_PUBLIC_LIFF_ID;

    if (!liffId) {
      return;
    }

    window.sessionStorage.removeItem("line_logout");
    await liff.init({ liffId });

    if (!liff.isLoggedIn()) {
      liff.login({ redirectUri: window.location.href });
      return;
    }

    await connect();
  }, [connect]);

  const logout = useCallback(async () => {
    window.sessionStorage.setItem("line_logout", "1");

    if (liff.id && liff.isLoggedIn()) {
      liff.logout();
    }

    setIdentity(null);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void connect().catch(() => undefined);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [connect]);

  const value = useMemo(
    () => ({ identity, isInitializing, login, logout }),
    [identity, isInitializing, login, logout],
  );

  return <LineContext value={value}>{children}</LineContext>;
}

export function useLineIdentity() {
  const context = useContext(LineContext);

  if (!context) {
    throw new Error("useLineIdentity must be used inside LineProvider.");
  }

  return context;
}
