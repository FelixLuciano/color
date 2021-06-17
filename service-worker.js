importScripts("https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js")

const CACHE_NAME = "tri"
const CACHE_CONTENT = [
	"https://cdnjs.cloudflare.com/ajax/libs/vue/3.0.11/vue.esm-browser.prod.js",
	"https://cdnjs.cloudflare.com/ajax/libs/hammer.js/2.0.8/hammer.min.js",
	"https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.css",
	"https://fonts.googleapis.com/css2?family=Manrope:wght@400700&display=swap",

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


self.addEventListener("install", function(event) {
	console.log("[ServiceWorker] Install")

	event.waitUntil((async () => {
		const cache = await caches.open(CACHE_NAME)
		// Setting {cache: "reload"} in the new request will ensure that the response
		// isn"t fulfilled from the HTTP cache i.e., it will be from the network.
		for (let content of CACHE_CONTENT)
			await cache.add(new Request(content, {cache: "reload"}))
	})())

	self.skipWaiting()
})

self.addEventListener("activate", (event) => {
	console.log("[ServiceWorker] Activate")

	event.waitUntil((async () => {
		// Enable navigation preload if it"s supported.
		// See https://developers.google.com/web/updates/2017/02/navigation-preload
		if ("navigationPreload" in self.registration)
			await self.registration.navigationPreload.enable()
	})())
  
	// Tell the active service worker to take control of the page immediately.
	self.clients.claim()
})

self.addEventListener("fetch", function(event) {
	// console.log("[Service Worker] Fetch", event.request.url)
	if (event.request.mode === "navigate") {
		const cache = await caches.open(CACHE_NAME)

		event.respondWith((async () => {
			try {
				const preloadResponse = await event.preloadResponse

				if (preloadResponse)
					return preloadResponse
		
				const networkResponse = await fetch(event.request)
				cache.put(event.request, networkResponse.clone())
				
				return networkResponse
			}
			catch (error) {
				console.log("[Service Worker] Fetch failed returning from cache instead.", error)
		
				const cachedResponse = await cache.match(event.request)
				return cachedResponse
			}
		})())
	}
})
