// Service Worker: PWA install eligibility 用の最小実装。
// 将来的にオフラインキャッシュを追加する場合は fetch ハンドラを実装する。
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // ネットワークパススルー（追加処理なし）
});
