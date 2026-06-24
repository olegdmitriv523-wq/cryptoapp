const CACHE_NAME = "united-europe-v7";
const APP_SHELL = [
  "/loading.html",
  "/login.html",
  "/register.html",
  "/terms.html",
  "/index.html",
  "/trade.html",
  "/assets.html",
  "/rewards.html",
  "/learning.html",
  "/info.html",
  "/deposit.html",
  "/withdraw.html",
  "/coin.html",
  "/profile.html",
  "/app.css",
  "/language-boot.js",
  "/app-nav.js",
  "/pwa.js",
  "/manifest.json",
  "/logo.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key)))));
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || url.pathname === "/health") return;
  const staticPath = url.pathname === "/" ? "/index.html" : url.pathname;
  const shouldCache = APP_SHELL.includes(staticPath);
  if (!shouldCache) return;

  if (url.pathname === "/loading.html") {
    event.respondWith(caches.match(staticPath).then(cached => cached || fetch(event.request)));
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(staticPath, copy));
        }
        return response;
      })
      .catch(() => caches.match(staticPath).then(cached => cached || caches.match("/loading.html")))
  );
});
