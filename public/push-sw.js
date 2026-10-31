// Imported into the generated service worker (see `pwa.workbox.importScripts` in nuxt.config.ts).
self.addEventListener("push", (event) => {
  const { title = "Moodly", body = "", url = "" } = event.data?.json() ?? {};
  event.waitUntil(
    self.registration.showNotification(title, {
      body,
      icon: "pwa-192x192.png",
      badge: "pwa-192x192.png",
      data: { url },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = new URL(event.notification.data?.url ?? "", self.registration.scope).href;
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((windows) => {
      const open = windows.find((w) => w.url.startsWith(self.registration.scope));
      return open ? open.focus() : self.clients.openWindow(target);
    }),
  );
});
