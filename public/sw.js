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
