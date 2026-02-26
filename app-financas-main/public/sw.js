/* Simple offline-first SW (no build plugin needed) */
const CACHE = 'finance-pwa-cache-v1'
const ASSETS = ['/', '/index.html', '/manifest.webmanifest']

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting())
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET') return
  event.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      const copy = res.clone()
      caches.open(CACHE).then(cache => cache.put(req, copy)).catch(()=>{})
      return res
    }).catch(()=> cached || caches.match('/index.html')))
  )
})
