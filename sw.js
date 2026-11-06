// Service worker: permite abrir la app sin conexión.
// Cambia VERSION cada vez que actualices los archivos para que el teléfono descargue la nueva versión.
const VERSION = 'finanzas-v3';
const LOGOS = 'finanzas-logos';
const FILES = [
  './', './index.html', './styles.css', './app.js', './manifest.json',
  './icons/icon-192.png', './icons/icon-512.png', './icons/apple-touch-icon.png', './icons/favicon.png',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== VERSION && k !== LOGOS).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Primero la red (para recibir actualizaciones); si no hay conexión, usa la copia guardada.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  // Logos de bancos: se guardan la primera vez para verlos sin conexión
  if (/icon\.horse$|google\.com$|gstatic\.com$|duckduckgo\.com$/.test(url.hostname) && /icon|favicon|ip3/.test(url.pathname)) {
    e.respondWith(caches.open(LOGOS).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(res => {
      c.put(e.request, res.clone()); return res;
    }))));
    return;
  }
  if (url.origin !== location.origin) return;
  e.respondWith(
    fetch(e.request)
      .then(res => {
        if (res.ok) { const copy = res.clone(); caches.open(VERSION).then(c => c.put(e.request, copy)); }
        return res;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true })
        .then(r => r || (e.request.mode === 'navigate' ? caches.match('./index.html') : undefined)))
  );
});
