// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js')

const cacheName = "tri"
const cacheStorage = [
  "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js",
  "https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.css",
  "/tri/index.html",
  "/tri/palette/index.html",
  "/tri/common/style.css",
  "/tri/css/style.css",
  "/tri/palette/css/style.css",
  "/tri/js/app.js",
  "/tri/js/components/color.mjs",
  "/tri/js/components/horizontal-scroll.mjs",
  "/tri/js/components/storage.mjs",
  "/tri/js/components/touch-slider.mjs",
  "/tri/js/components/utils.mjs"
]

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting()
})

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(cacheName)
      .then((cache) => cache.addAll(cacheStorage))
  )
})

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable()
}

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const r = await caches.match(event.request)

    if (r) return r

    const response = await fetch(event.request)
    const cache = await caches.open(cacheName)

    cache.put(event.request, response.clone())
    
    return response
  })())
})
