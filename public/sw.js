// Service Worker pour WelcomeApp PWA
const CACHE_NAME = 'welcomeapp-v1'
const urlsToCache = [
  '/',
  '/backgrounds/default-1.jpg',
  '/backgrounds/default-2.jpg',
  '/backgrounds/default-3.jpg',
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cache opened')
      return cache.addAll(urlsToCache)
    })
  )
  self.skipWaiting()
})

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  return self.clients.claim()
})

// Stratégie Network First avec fallback sur cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Si la requête réussit, on met en cache et on retourne la réponse
        if (response && response.status === 200) {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      })
      .catch(() => {
        // Si la requête échoue (offline), on retourne depuis le cache
        return caches.match(event.request).then((response) => {
          return response || new Response('Offline', { status: 503 })
        })
      })
  )
})
