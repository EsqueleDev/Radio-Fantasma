const CACHE_NAME = "offline-v1";

const OFFLINE_FILES = [
    "/offline.html",
    "/img/offline.jpg"
];

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(OFFLINE_FILES))
    );

    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            )
        )
    );

    self.clients.claim();
});

self.addEventListener("fetch", (event) => {
    event.respondWith(
        fetch(event.request)
            .catch(async () => {

                // Se for navegação (HTML)
                if (event.request.mode === "navigate") {
                    return caches.match("/offline.html");
                }

                // Se for imagem
                if (event.request.destination === "image") {
                    return caches.match("/img/offline.jpg");
                }

                return new Response("", {
                    status: 503,
                    statusText: "Offline"
                });
            })
    );
});