const CACHE_NAME = 'static-cache-v1';
const STATIC_ASSETS = [
    '/404.html',
    '/error.html',
    '/index.html',
    '/index.js',
    '/favicon.ico',
    '/css/components.css',
    '/css/contextMenu.css',
    '/css/layout.css',
    '/css/login.css',
    '/css/table.css',
    '/assets/icons/delete.svg',
    '/assets/icons/download.svg',
    '/assets/icons/rename.svg',
    '/assets/file-icons/access.png',
    '/assets/file-icons/archive.png',
    '/assets/file-icons/audio.png',
    '/assets/file-icons/binary.png',
    '/assets/file-icons/code.png',
    '/assets/file-icons/database.png',
    '/assets/file-icons/excel.png',
    '/assets/file-icons/file.png',
    '/assets/file-icons/folder.png',
    '/assets/file-icons/image.png',
    '/assets/file-icons/oneNote.png',
    '/assets/file-icons/pdf.png',
    '/assets/file-icons/powerPoint.png',
    '/assets/file-icons/project.png',
    '/assets/file-icons/publisher.png',
    '/assets/file-icons/sharePoint.png',
    '/assets/file-icons/sway.png',
    '/assets/file-icons/text.png',
    '/assets/file-icons/video.png',
    '/assets/file-icons/visio.png',
    '/assets/file-icons/word.png',
];

// ────────── Install Event ──────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[SW] Pre-caching static assets...');
            return cache.addAll(STATIC_ASSETS);
        })
    );
});

self.addEventListener('fetch', event => {
    const request = event.request;

    // Skip non-GET or non-HTTP(S) requests
    if (request.method !== 'GET' || !request.url.startsWith('http')) return;

    event.respondWith(
        caches.open(CACHE_NAME).then(async cache => {
            const cached = await cache.match(request);

            // If no cache exists, fetch and store it
            if (!cached) {
                console.log(`[SW] No cache, fetching: ${request.url}`);
                const netRes = await fetch(request);
                if (netRes.ok) cache.put(request, netRes.clone());
                return netRes;
            }

            // Build a new request with preserved metadata + conditional headers
            const etag = cached.headers.get('ETag');
            const lastMod = cached.headers.get('Last-Modified');
            const conditionalRequest = new Request(request, {
                headers: {
                    ...(etag && { 'If-None-Match': etag }),
                    ...(lastMod && { 'If-Modified-Since': lastMod }),
                },
                cache: 'no-store',
            });

            try {
                const netRes = await fetch(conditionalRequest);

                // Use cached copy if not modified
                if (netRes.status === 304) return cached;

                // Only update cache and log if ETag changed
                const newEtag = netRes.headers.get('ETag');
                if (!newEtag || newEtag !== etag) {
                    console.log(`[SW] Updated cache (new version): ${request.url}`);
                    cache.put(request, netRes.clone());
                }

                return netRes.ok ? netRes : cached;
            } catch {
                console.warn(`[SW] Network failed, using cache: ${request.url}`);
                return cached;
            }
        })
    );
});
