const CACHE_NAME = 'proteinas-v0.0.2b'; // Cambia el número de versión
const URLS_TO_CACHE = [
  '/protein-calc/',
  '/protein-calc/index.html',
  '/protein-calc/manifest.json',
  '/protein-calc/sw.js',
  '/protein-calc/icon-192.png',
  '/protein-calc/icon-512.png',
  '/protein-calc/app.js',
  '/protein-calc/styles.css'
];

// Instalar el Service Worker y almacenar los recursos en caché
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(URLS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Forzar la activación inmediata del nuevo SW
});

// Activar el Service Worker y limpiar cachés antiguos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName); // Eliminar cachés antiguos
          }
        })
      );
    })
  );
  self.clients.claim(); // Tomar control de las páginas abiertas
});

// Interceptar las solicitudes de red
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Si el recurso está en caché, devolverlo
        return cachedResponse;
      }
      // Si no está en caché, intentar obtenerlo de la red
      return fetch(event.request)
        .then((networkResponse) => {
          // Almacenar en caché la respuesta de la red para futuras solicitudes
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => {
          // Manejar errores de red (opcional: devolver un recurso predeterminado)
          if (event.request.destination === 'document') {
            return caches.match('./index.html'); // Devolver la página principal si falla
          }
        });
    })
  );
});

const manifest = {
  "start_url": "/protein-calc/index.html",
  "scope": "/protein-calc/"
};

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js').then((registration) => {
    console.log('Service Worker registrado con éxito:', registration);
  }).catch((error) => {
    console.error('Error al registrar el Service Worker:', error);
  });
}