const CACHE_NAME = "tri"
const CACHE_CONTENT = [
	"https://cdnjs.cloudflare.com/ajax/libs/vue/3.1.1/vue.esm-browser.prod.js",
	"https://cdnjs.cloudflare.com/ajax/libs/meyer-reset/2.0/reset.css",

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
	"https://lucianofelix.com.br/tri/js/components/horizontal_scroll.mjs",
	"https://lucianofelix.com.br/tri/js/components/icons.mjs",
	"https://lucianofelix.com.br/tri/js/components/responsive_pointer.mjs",
	"https://lucianofelix.com.br/tri/js/components/storage.mjs",
	"https://lucianofelix.com.br/tri/js/components/touch_slider.mjs",
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
		for (let resource of CACHE_CONTENT) {
			console.log(`[Service Worker] Caching resource: ${resource}`)
			await cache.add(new Request(resource, {cache: "reload"}))
		}
	})())

	self.skipWaiting()
})

self.addEventListener("fetch", async function(event) {
	console.log(`[Service Worker] Fetching resource: ${event.request.url}`)
	if (event.request.mode === "navigate") {
		if (request) return request

		const response = await fetch(event.request)
		const cache = await caches.open(cacheName)

		console.log(`[Service Worker] Caching new resource: ${event.request.url}`)

		cache.put(event.request, response.clone())

		return response
	}
})
