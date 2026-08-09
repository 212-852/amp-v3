"use client";

import { useSyncExternalStore } from "react";

type StandaloneNavigator = Navigator & {
  standalone?: boolean;
};

function subscribeToDisplayMode(onStoreChange: () => void) {
  const mediaQuery = window.matchMedia("(display-mode: standalone)");

  mediaQuery.addEventListener("change", onStoreChange);

  return () => {
    mediaQuery.removeEventListener("change", onStoreChange);
  };
}

function getStandaloneSnapshot() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as StandaloneNavigator).standalone === true
  );
}

function getServerStandaloneSnapshot() {
  return false;
}

export default function MainAppPage() {
  const isStandalone = useSyncExternalStore(
    subscribeToDisplayMode,
    getStandaloneSnapshot,
    getServerStandaloneSnapshot,
  );
  const entrySource = isStandalone ? "pwa" : "web";

  return (
    <main>
      <h1>LIFF / Web App (PWA)</h1>
      <p>Entry Source: {entrySource}</p>
    </main>
  );
}