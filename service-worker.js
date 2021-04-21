importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js')

const cacheName = "tri"
const contentToCache = [
  "https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js",
  "https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js",
  "https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.css",
  "https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap",

  "/tri/assets/icons/favicon.ico",
  "/tri/assets/icons/favicon-16x16.png",
  "/tri/assets/icons/favicon-32x32.png",
  "/tri/assets/icons/android-chrome-maskable-192x192.png",
  "/tri/assets/icons/android-chrome-maskable-512x512.png",
  "/tri/assets/icons/android-chrome-192x192.png",
  "/tri/assets/icons/android-chrome-512x512.png",
  "/tri/assets/icons/shortcut-mixer-192x192.png",
  "/tri/assets/icons/shortcut-palette-192x192.png",
  "/tri/assets/icons/mstile-144x144.png",
  "/tri/assets/icons/browserconfig.xml",
  "/tri/assets/icons/apple-touch-icon.png",
  "/tri/assets/icons/safari-pinned-tab.svg",
  "/tri/assets/screenshots/app-desktop.webp",
  "/tri/assets/screenshots/palette-desktop.webp",
  "/tri/assets/screenshots/app-mobile.webp",
  "/tri/assets/screenshots/palette-mobile.webp",

  "/tri/",
  "/tri/index.html",
  "/tri/common/style.css",
  "/tri/css/style.css",
  "/tri/js/app.js",
  "/tri/js/components/color.mjs",
  "/tri/js/components/horizontal-scroll.mjs",
  "/tri/js/components/storage.mjs",
  "/tri/js/components/touch-slider.mjs",
  "/tri/js/components/utils.mjs",

  "/tri/palette/",
  "/tri/palette/index.html",
  "/tri/palette/css/style.css",
]

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Install')

  event.waitUntil((async () => {
    const cache = await caches.open(cacheName)

    console.log('[Service Worker] Caching all: app shell and content')

    await cache.addAll(contentToCache)
  })())
})

self.addEventListener('fetch', (event) => {
  event.respondWith((async () => {
    const request = await caches.match(event.request)

    console.log(`[Service Worker] Fetching resource: ${event.request.url}`)

    if (request) return request

    const response = await fetch(event.request)
    const cache = await caches.open(cacheName)

    console.log(`[Service Worker] Caching new resource: ${event.request.url}`)

    cache.put(event.request, response.clone())

    return response
  })())
})
