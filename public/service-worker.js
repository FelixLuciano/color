// https://simplepwa.com

const cacheName = "tri@2.1.0" // Change value to force update

self.addEventListener("install", event => {
	self.skipWaiting()

	event.waitUntil(
		caches.open(cacheName).then(cache => {
			return cache.addAll([
				"/",
				"/icons/manifest.json",

				"/icons/apple-touch-icon.png",
				"/icons/android-chrome-192x192.png",
				"/icons/android-chrome-512x512.png",
				"/icons/maskable_icon.png",
				"/icons/favicon-16x16.png",
				"/icons/favicon-32x32.png",
				"/icons/favicon.svg",
				"/favicon.ico",

				"/index.html",
				"/style.css",
				"/color.mjs",
				"/picker.mjs",

				"/swatches/index.html",
				"/swatches/swatches.mjs",

				"/palettes/index.html",
				"/palettes/palettes.mjs",
			])
		})
	)
})

self.addEventListener("activate", event => {
	// Delete any non-current cache
	event.waitUntil(
		caches.keys().then(keys => {
			Promise.all(
				keys.map(key => {
					if (![cacheName].includes(key)) {
						return caches.delete(key)
					}
				})
			)
		})
	)
})

// Offline-first, cache-first strategy
// Kick off two asynchronous requests, one to the cache and one to the network
// If there's a cached version available, use it, but fetch an update for next time.
// Gets data on screen as quickly as possible, then updates once the network has returned the latest data. 
self.addEventListener("fetch", event => {
	event.respondWith(
		caches.open(cacheName).then(cache => {
			return cache.match(event.request).then(response => {
				return response || fetch(event.request).then(networkResponse => {
					cache.put(event.request, networkResponse.clone())
					return networkResponse
				})
			})
		})
	)
})
