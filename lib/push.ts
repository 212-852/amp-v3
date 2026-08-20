export type PushMethod = "push" | "line" | "email";

export function isInstalledPwa() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true;
}

function decodeApplicationKey(value: string) {
  const padding = "=".repeat((4 - value.length % 4) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(window.atob(base64), (character) => character.charCodeAt(0));
}

export async function acquirePushSubscription() {
  const publicKey = process.env.NEXT_PUBLIC_WEB_PUSH_PUBLIC_KEY;
  if (!publicKey) throw new Error("push_public_key_missing");
  if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
    throw new Error("push_not_supported");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") throw new Error("push_permission_denied");

  const registration = await navigator.serviceWorker.register("/push.js");
  await navigator.serviceWorker.ready;
  const existing = await registration.pushManager.getSubscription();
  return existing ?? registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: decodeApplicationKey(publicKey),
  });
}

export async function releasePushSubscription() {
  if (!("serviceWorker" in navigator)) return;
  const registration = await navigator.serviceWorker.getRegistration();
  const subscription = await registration?.pushManager.getSubscription();
  await subscription?.unsubscribe();
}
