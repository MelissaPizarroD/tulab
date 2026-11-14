const CACHE_NAME = 'tulab-terminal-v2';
const BASE = '/terminal/';
const PRECACHE = [BASE, BASE + 'index.html', BASE + 'manifest.json', BASE + 'tulab_logo.svg'];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE)));
  self.skipWaiting();
});

// Borra cachés de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // La API y /health nunca pasan por caché: useConexion necesita que /health
  // falle de verdad cuando no hay internet, y la app ya maneja offline con IndexedDB
  if (url.pathname.includes('/api/') || url.pathname.endsWith('/health')) return;

  // Navegación (abrir o recargar la página): red primero, caché si no hay conexión
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copia = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(BASE, copia));
          return res;
        })
        .catch(() => caches.match(BASE))
    );
    return;
  }

  // Archivos estáticos (JS, CSS, fuentes, logo): caché primero y se guardan al descargarlos
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request).then((res) => {
          if (res.ok) {
            const copia = res.clone();
            caches.open(CACHE_NAME).then((c) => c.put(request, copia));
          }
          return res;
        })
    )
  );
});