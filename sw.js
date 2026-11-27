/* Guarda la app en el celular para que abra sin internet.
   Cuando subas cambios, sube también este archivo cambiando el número de VERSION. */
var VERSION = 'urnas-v4.11';
var ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) {
    return Promise.all(ks.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
/* Solo los archivos de la app; los datos de la hoja van directo a Google */
self.addEventListener('fetch', function (e) {
  var url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== self.location.origin) return;
  e.respondWith(caches.open(VERSION).then(function (c) {
    return c.match(e.request, { ignoreSearch: true }).then(function (guardado) {
      var red = fetch(e.request).then(function (r) { if (r && r.ok) c.put(e.request, r.clone()); return r; })
        .catch(function () { return guardado || c.match('index.html'); });
      return guardado || red;
    });
  }));
});
