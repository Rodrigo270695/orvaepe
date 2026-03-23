/**
 * Service worker en la raíz (scope /) para instalación PWA.
 * Las vistas siguen siendo HTML del servidor (Inertia); no hay offline de rutas.
 */
self.addEventListener('install', (event) => {
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(fetch(event.request));
});
