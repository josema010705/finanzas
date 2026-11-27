// Service worker: guarda la app en el dispositivo para que abra sin internet.
// Al publicar una nueva version, cambia VERSION para que los celulares la descarguen.
const VERSION = "finanzas-v1.1.0";
const ARCHIVOS = [
  "./", "./index.html", "./manifest.webmanifest",
  "./Fuentes/DMSans-latin.woff2", "./Fuentes/BebasNeue-latin.woff2",
  "./Iconos/apple-touch-icon.png", "./Iconos/icon-192.png", "./Iconos/icon-512.png", "./Iconos/icon-512-maskable.png",
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(ks => Promise.all(ks.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Primero la copia guardada (rapido y sin internet); en segundo plano se actualiza.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(VERSION).then(async cache => {
    const guardado = await cache.match(req, { ignoreSearch: true });
    const red = fetch(req).then(r => { if (r.ok) cache.put(req, r.clone()); return r; }).catch(() => guardado);
    return guardado || red;
  }));
});
