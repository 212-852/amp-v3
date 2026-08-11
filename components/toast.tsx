"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";

type ToastProps = {
  message: string | null;
  onClose: () => void;
};

function subscribe() {
  return () => undefined;
}

export function Toast({ message, onClose }: ToastProps) {
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);

  useEffect(() => {
    if (!message) return;
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, [message, onClose]);

  if (!mounted || !message) return null;

  return createPortal(
    <div className="greetingToast" role="status" aria-live="polite">
      <span>{message}</span>
      <button type="button" aria-label="Close greeting" onClick={onClose}>×</button>
    </div>,
    document.body,
  );
}
