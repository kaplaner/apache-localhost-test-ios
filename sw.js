var filesToCache = [
    // mainFiles: [
       './apache-localhost-test-ios/',
       './apache-localhost-test-ios/sw.js/index.html',
       './apache-localhost-test-ios/sw.js/index.js',
       './apache-localhost-test-ios/sw.js/styles.css',
    // ]
 // var versionFiles = [
        // "/content/resources/css/mobile-chutes-ui.min.css?v=",
        // "/content/resources/js/mobile-chutes-ui.min.js?v=",
        // "/content/resources/js/components/share-menu/share-menu-styles.css?v=",
//         "https://develop.citia.com/content/resources/js/components/share-menu/share-menu-styles.css?v=8.64.0-48cdf6e-1554886819290",
    // ],
    // orgCssVersionFiles: [
        // "/content/template/singleCards.css?v=",
//         "https://develop.citia.com/content/template/singleCards.css?v=1552400873000",
    // ],
    // nonVersionFiles: [
        // "/common/jquery/jquery-2.1.3.min.js",
//         "https://develop.citia.com/common/font-awesome/4.4.0/css/font-awesome.min.css"
    ]
// };

// var filesToCache = {
//     versionFiles: [
//      "/content/resources/css/" + viewUITypeSlug + ".min.css?v=",
//      "/content/resources/js/" + viewUITypeSlug + ".min.js?v=",
//      "/content/resources/js/components/share-menu/share-menu-styles.css?v="
//     ],
//     orgCssVersionFiles: [
//         "/content/template/singleCards.css?v="
//     ],
//     nonVersionFiles: [
//         "/common/jquery/jquery-2.1.3.min.js",
//         "/common/font-awesome/4.4.0/css/font-awesome.min.css"
//     ]
// };

// var cachePrefix = viewShortName + '-cache-';
// var viewStaticCache = cachePrefix + version + '-' + organizationCssVersion;
// var viewStaticCache = cachePrefix + version + '-' + organizationCssVersion + '-' + viewVersion;
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

                // var urlsToCache = [ ];

                // // Versioned Files
                // for (let i = 0; i < filesToCache.versionFiles.length; i++) {
                //     urlsToCache.push(filesToCache.versionFiles[i] + version);
                // }

                // // Organization Versioned Files
                // for (let i = 0; i < filesToCache.orgCssVersionFiles.length; i++) {
                //     urlsToCache.push(filesToCache.orgCssVersionFiles[i] + organizationCssVersion);
                // }

                // // Non Versioned Files
                // for (let i = 0; i < filesToCache.nonVersionFiles.length; i++) {
                //     urlsToCache.push(filesToCache.nonVersionFiles[i]);
                // }

                // console.log(urlsToCache);

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
