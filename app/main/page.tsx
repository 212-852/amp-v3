"use client";

import { useEffect, useState } from "react";

type EntrySource = "web" | "pwa";

type StandaloneNavigator = Navigator & {
  standalone?: boolean;
};

export default function MainAppPage() {
  const [entrySource, setEntrySource] = useState<EntrySource>("web");

  useEffect(() => {
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as StandaloneNavigator).standalone === true;

    setEntrySource(isStandalone ? "pwa" : "web");
  }, []);

  return (
    <main>
      <h1>LIFF / Web App (PWA)</h1>
      <p>Entry Source: {entrySource}</p>
    </main>
  );
}