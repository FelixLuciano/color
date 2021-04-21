// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js')

const CACHE = "br.com.lucianofelix.tri"
const cacheStorage = [
  { "revision": null, "url": "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js" },
  { "revision": null, "url": "https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js" },
  { "revision": null, "url": "https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.css" },
  { "revision": "03ea588cf9d1", "url": "/tri/index.html" },
  { "revision": "03ea588cf9d1", "url": "/tri/palette/index.html" },
  { "revision": "03ea588cf9d1", "url": "/tri/common/style.css" },
  { "revision": "03ea588cf9d1", "url": "/tri/css/style.css" },
  { "revision": "03ea588cf9d1", "url": "/tri/palette/css/style.css" },
  { "revision": "03ea588cf9d1", "url": "/tri/js/app.js" },
  { "revision": "03ea588cf9d1", "url": "/tri/js/components/color.mjs" },
  { "revision": "03ea588cf9d1", "url": "/tri/js/components/horizontal-scroll.mjs" },
  { "revision": "03ea588cf9d1", "url": "/tri/js/components/storage.mjs" },
  { "revision": "03ea588cf9d1", "url": "/tri/js/components/touch-slider.mjs" },
  { "revision": "03ea588cf9d1", "url": "/tri/js/components/utils.mjs" }
]

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }
})

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
      .then((cache) => cache.addAll(cacheStorage))
  )
})

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable()
}

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse

        if (preloadResp) {
          return preloadResp
        }

        const networkResp = await fetch(event.request)
        return networkResp
      } catch (error) {

        const cache = await caches.open(CACHE)
        const cachedResp = await cache.match(offlineFallbackPage)
        return cachedResp
      }
    })())
  }
})
