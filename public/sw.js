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

// No interceptamos fetch para evitar rechazos no controlados en navegación.
// Este SW solo se usa para habilitar instalación y scope de la PWA.
