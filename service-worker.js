importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js')

const cacheName = "tri"
const contentToCache = [
	"https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js",
	"https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.css",
	"https://fonts.googleapis.com/css2?family=Manrope:wght@400;700&display=swap",

	"https://lucianofelix.com.br/tri/assets/icons/favicon.ico",
	"https://lucianofelix.com.br/tri/assets/icons/favicon-16x16.png",
	"https://lucianofelix.com.br/tri/assets/icons/favicon-32x32.png",
	"https://lucianofelix.com.br/tri/assets/icons/android-chrome-maskable-192x192.png",
	"https://lucianofelix.com.br/tri/assets/icons/android-chrome-maskable-512x512.png",
	"https://lucianofelix.com.br/tri/assets/icons/android-chrome-192x192.png",
	"https://lucianofelix.com.br/tri/assets/icons/android-chrome-512x512.png",
	"https://lucianofelix.com.br/tri/assets/icons/shortcut-mixer-192x192.png",
	"https://lucianofelix.com.br/tri/assets/icons/shortcut-palette-192x192.png",
	"https://lucianofelix.com.br/tri/assets/icons/mstile-144x144.png",
	"https://lucianofelix.com.br/tri/assets/icons/browserconfig.xml",
	"https://lucianofelix.com.br/tri/assets/icons/apple-touch-icon.png",
	"https://lucianofelix.com.br/tri/assets/icons/safari-pinned-tab.svg",
	"https://lucianofelix.com.br/tri/assets/screenshots/app-desktop.webp",
	"https://lucianofelix.com.br/tri/assets/screenshots/palette-desktop.webp",
	"https://lucianofelix.com.br/tri/assets/screenshots/app-mobile.webp",
	"https://lucianofelix.com.br/tri/assets/screenshots/palette-mobile.webp",

	"https://lucianofelix.com.br/tri/",
	"https://lucianofelix.com.br/tri/index.html",
	"https://lucianofelix.com.br/tri/common/style.css",
	"https://lucianofelix.com.br/tri/css/style.css",
	"https://lucianofelix.com.br/tri/js/app.js",
	"https://lucianofelix.com.br/tri/js/components/color.mjs",
	"https://lucianofelix.com.br/tri/js/components/horizontal-scroll.mjs",
	"https://lucianofelix.com.br/tri/js/components/storage.mjs",
	"https://lucianofelix.com.br/tri/js/components/touch-slider.mjs",
	"https://lucianofelix.com.br/tri/js/components/utils.mjs",

	"https://lucianofelix.com.br/tri/palette/",
	"https://lucianofelix.com.br/tri/palette/index.html",
	"https://lucianofelix.com.br/tri/palette/css/style.css",
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
