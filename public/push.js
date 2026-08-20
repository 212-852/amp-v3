self.addEventListener("push", (event) => {
  const payload = event.data ? event.data.json() : {};
  event.waitUntil(self.registration.showNotification(payload.title || "わんだにゃー", {
    body: payload.body || "新しいお知らせがあります。",
    icon: "/icons/icon_192.png",
    badge: "/icons/icon_192.png",
    data: { url: payload.url || "/" },
  }));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url || "/", self.location.origin).href;
  event.waitUntil(clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
    const current = windows.find((client) => client.url === target);
    return current ? current.focus() : clients.openWindow(target);
  }));
});
