const CACHE = "trs-v1";
const SHELL = ["/", "/index.html", "/manifest.webmanifest", "/icon-192.png"];
self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);
  if (e.request.method !== "GET" || url.pathname.startsWith("/api/")) return;
  if (e.request.mode === "navigate") {
    e.respondWith(fetch(e.request).then((res) => { const c = res.clone(); caches.open(CACHE).then((cache) => cache.put("/index.html", c)); return res; }).catch(() => caches.match("/index.html")));
    return;
  }
  e.respondWith(caches.match(e.request).then((hit) => hit || fetch(e.request).then((res) => { if (res.ok && url.origin === location.origin) { const c = res.clone(); caches.open(CACHE).then((cache) => cache.put(e.request, c)); } return res; })));
});
