var filesToCache = [
       './',
       './index.html',
       './index.js',
       './styles.css',
]
var viewStaticCache = "video-cardsite.2-cache-8.64.0-48cdf6e-1554886819290-1552400873000";

var allCaches = [
    viewStaticCache
];
var onLine;

self.addEventListener('install',function(event) {
    console.log('[install] Kicking off service worker registration!');
    event.waitUntil(
        caches.open(viewStaticCache)
            .then(function(cache) {
                console.log('Adding files from json file');
                console.log(filesToCache);

                return cache.addAll(filesToCache);
            })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.filter(function(cacheName) {
                    return cacheName.startsWith('video-cardsite.2') &&
                        !allCaches.includes(cacheName);
                }).map(function(cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('fetch', function(event) {
    if (event.request.method === 'PUT') {
        return;
    }

    if (event.request.method === 'POST') {
        return;
    }

    if (event.request.headers.get('range')) {
        return;
    }

    console.log('Handling fetch event for', event.request);

    var requestUrl = new URL(event.request.url);
    if (requestUrl.origin === location.origin && requestUrl.pathname.startsWith('/api/')) {
        event.respondWith(serveData(event.request));
        return;
    }

    event.respondWith(serveAssets(event.request));
});

function serveData(request) {
    return fetch(request)
        .then(function (networkResponse) {
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                return networkResponse;
            }

            caches.open(viewStaticCache)
                .then(function (cache) {
                    cache.put(request, networkResponse);
                });

            return networkResponse.clone();
        })
        .catch(function () {
            return caches.match(request);
        });
}

function serveAssets(request) {
    return caches.open(viewStaticCache).then(function(cache) {
        return cache.match(request).then(function(response) {
            if (response) {
                return response;
            }

            return fetch(request).then(function(networkResponse) {
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }

                cache.put(request, networkResponse.clone());
                return networkResponse;
            });
        });
    });
}
