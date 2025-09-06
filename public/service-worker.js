const CACHE_NAME = "alchemshare-cache-v1";

const FILES_TO_CACHE = [
    "/",
    "/index.html",
    "/index.js",
    "/favicon.ico",
    "/manifest.json"
];

self.addEventListener("install", event => {
    console.log("[Service Worker] Installing...");
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log("[Service Worker] Caching app shell");
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener("activate", event => {
    console.log("[Service Worker] Activating...");
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames.map(name => {
                    if (name !== CACHE_NAME) {
                        console.log("[Service Worker] Deleting old cache:", name);
                        return caches.delete(name);
                    }
                })
            )
        )
    );
    self.clients.claim();
});

self.addEventListener("fetch", event => {
    // Only handle GET requests over http/https
    if (event.request.method !== "GET" || !event.request.url.startsWith("http")) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            const cachedResponse = await cache.match(event.request);

            try {
                // Make a HEAD request to check ETag or Last-Modified
                const headResponse = await fetch(event.request, { method: "HEAD" });
                const networkETag = headResponse.headers.get("ETag");
                const networkLastModified = headResponse.headers.get("Last-Modified");

                let cachedETag, cachedLastModified;
                if (cachedResponse) {
                    cachedETag = cachedResponse.headers.get("ETag");
                    cachedLastModified = cachedResponse.headers.get("Last-Modified");
                }

                // If file changed (ETag or Last-Modified differ), fetch new version
                if (!cachedResponse || networkETag !== cachedETag || networkLastModified !== cachedLastModified) {
                    const networkResponse = await fetch(event.request);

                    // Only cache valid responses
                    if (networkResponse && networkResponse.status === 200 && networkResponse.type !== "opaque") {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }

                // File unchanged → return cached version
                return cachedResponse;
            } catch (err) {
                // On error (offline etc.) fallback to cache
                return cachedResponse;
            }
        })
    );
});