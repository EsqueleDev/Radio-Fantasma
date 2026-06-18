const CACHE_NAME = "radio-fantasma-v1";

const urlsToCache = [
    "/",
];

self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});