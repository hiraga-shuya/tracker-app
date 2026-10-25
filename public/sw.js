// PWA としてインストール可能にするための最小の Service Worker。
// いまはキャッシュを一切せず、通信はすべてそのままネットワークへ流す
// （オフライン対応をする場合は、ここにキャッシュ方針を足していく）。
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});

// プッシュ通知が届いたら表示する（リマインダー機能）。
self.addEventListener("push", (event) => {
  let data = {
    title: "習慣化頑張るくん",
    body: "リマインダーの時間です",
    url: "/",
  };

  try {
    if (event.data) {
      data = { ...data, ...event.data.json() };
    }
  } catch {
    // 送られてきた中身が読めなければ、既定の文面で表示する
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: { url: data.url },
    }),
  );
});

// 通知をタップしたら、アプリの該当ページを開く。
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const url = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clients) => {
        for (const client of clients) {
          if ("focus" in client) {
            client.navigate(url);
            return client.focus();
          }
        }

        return self.clients.openWindow(url);
      }),
  );
});
