const CACHE = "curaos-site-v7";
const ASSETS = ["./", "./index.html", "./css/style.css?v=2.3", "./js/main.js?v=2.3", "./media/logo.png", "./favicon.ico", "./favicon.png", "./manifest.json"];
self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Network-first for html/root to prevent stale caching
  if (e.request.mode === "navigate" || e.request.headers.get("accept")?.includes("text/html")) {
    e.respondWith(
      fetch(e.request).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return res;
      }).catch(() => caches.match(e.request) || caches.match("./index.html"))
    );
    return;
  }
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy));
      return res;
    }))
  );
});
