// Service worker de My Movers album: guarda la web entera en el aparato para
// que funcione sin internet despues de la primera visita.
//
// Como funciona:
//   - Al instalarse guarda TODOS los archivos de precache-list.js de golpe, en
//     una cache con el nombre de la version. Si falla uno, no se instala (y la
//     version anterior sigue funcionando entera).
//   - Despues sirve siempre desde esa cache: la web abre al instante y nunca
//     mezcla archivos de dos versiones.
//   - Cuando hay version nueva, se instala en segundo plano y espera. La web
//     ofrece "Reload"; si nadie lo pulsa, entra al cerrar todas las pestanas.
//   - Al activarse una version, borra las caches de las anteriores.
//
// Es un script clasico (no un modulo) para que funcione en Safari antiguo.

/* global self, caches, importScripts */
importScripts('precache-list.js');

const PREFIX = 'movers-album-';
const CACHE = `${PREFIX}${self.PRECACHE_VERSION}`;
const absolute = (path) => new URL(path, self.location).href;

// Cada archivo se pide a la red de verdad (cache: 'reload'): si no, el navegador
// podia dar copias viejas de su cache HTTP (GitHub Pages las guarda 10 minutos)
// y la version nueva quedaba guardada con archivos de la anterior.
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE)
    .then((cache) => cache.addAll(self.PRECACHE.map((path) => new Request(absolute(path), { cache: 'reload' })))));
});

// Algunos servidores (npx serve, Cloudflare Pages) redirigen /index.html a /.
// Una respuesta redirigida no vale para abrir una pagina: se rehace limpia.
const plain = (response) => (response && response.redirected
  ? new Response(response.body, { status: response.status, statusText: response.statusText, headers: response.headers })
  : response);

self.addEventListener('activate', (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys
      .filter((key) => key.startsWith(PREFIX) && key !== CACHE)
      .map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data === 'skip-waiting' || data.type === 'skip-waiting') self.skipWaiting();
  if (data.type === 'version' && event.ports && event.ports[0]) {
    caches.open(CACHE)
      .then((cache) => cache.keys())
      .then((keys) => event.ports[0].postMessage({ version: self.PRECACHE_VERSION, saved: keys.length, total: self.PRECACHE.length }))
      .catch(() => event.ports[0].postMessage({ version: self.PRECACHE_VERSION, saved: 0, total: self.PRECACHE.length }));
  }
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    // La web es una sola pagina con rutas #/...: cualquier navegacion es index.html.
    if (request.mode === 'navigate') {
      const page = await cache.match(absolute('./index.html'));
      if (page) return plain(page);
    }
    const hit = await cache.match(request, { ignoreSearch: true });
    if (hit) return hit;
    try {
      return await fetch(request);
    } catch (error) {
      if (request.mode === 'navigate') {
        const page = await cache.match(absolute('./index.html'));
        if (page) return plain(page);
      }
      throw error;
    }
  })());
});
