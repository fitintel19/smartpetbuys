/**
 * Service Worker for SmartPetBuys
 * Implements mobile-first caching strategies, offline capabilities,
 * and performance optimizations
 * Version: 1.0
 */

const CACHE_VERSION = 'smartpetbuys-v1.0';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const IMAGE_CACHE = `${CACHE_VERSION}-images`;

// Resources to cache immediately
const STATIC_ASSETS = [
    '/',
    '/offline.html',
    '/css/extended/critical.css',
    '/js/mobile-menu.js',
    '/js/performance-loader.js',
    '/images/smartpetbuys_logo.png',
    '/favicon.ico'
];

// Cache strategies for different resource types
const CACHE_STRATEGIES = {
    pages: 'networkFirst',
    css: 'staleWhileRevalidate',
    js: 'staleWhileRevalidate',
    images: 'cacheFirst',
    fonts: 'cacheFirst',
    api: 'networkFirst'
};

// Cache durations (in seconds)
const CACHE_DURATIONS = {
    static: 86400 * 30,    // 30 days
    dynamic: 86400 * 7,    // 7 days
    images: 86400 * 30,    // 30 days
    fonts: 86400 * 365     // 1 year
};

/**
 * Install event - cache static assets
 */
self.addEventListener('install', event => {
    console.log('Service Worker installing...');
    
    event.waitUntil(
        caches.open(STATIC_CACHE)
            .then(cache => {
                console.log('Caching static assets...');
                return cache.addAll(STATIC_ASSETS);
            })
            .then(() => {
                console.log('Static assets cached successfully');
                return self.skipWaiting();
            })
            .catch(error => {
                console.error('Failed to cache static assets:', error);
            })
    );
});

/**
 * Activate event - clean up old caches
 */
self.addEventListener('activate', event => {
    console.log('Service Worker activating...');
    
    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames.map(cacheName => {
                        if (cacheName.includes('smartpetbuys') && 
                            !cacheName.includes(CACHE_VERSION)) {
                            console.log('Deleting old cache:', cacheName);
                            return caches.delete(cacheName);
                        }
                    })
                );
            })
            .then(() => {
                console.log('Old caches cleaned up');
                return self.clients.claim();
            })
            .catch(error => {
                console.error('Failed to clean up caches:', error);
            })
    );
});

/**
 * Fetch event - implement caching strategies
 */
self.addEventListener('fetch', event => {
    const request = event.request;
    const url = new URL(request.url);
    
    // Skip non-GET requests
    if (request.method !== 'GET') {
        return;
    }
    
    // Skip Chrome extension requests
    if (url.protocol === 'chrome-extension:') {
        return;
    }
    
    // Determine resource type and apply appropriate strategy
    const resourceType = getResourceType(url);
    const strategy = CACHE_STRATEGIES[resourceType] || 'networkFirst';
    
    event.respondWith(
        handleRequest(request, strategy, resourceType)
    );
});

/**
 * Determine resource type from URL
 */
function getResourceType(url) {
    const pathname = url.pathname;
    const origin = url.origin;
    
    // External resources
    if (origin !== self.location.origin) {
        if (url.hostname.includes('fonts.g')) {
            return 'fonts';
        }
        return 'api';
    }
    
    // Internal resources
    if (pathname.match(/\.(css)$/)) return 'css';
    if (pathname.match(/\.(js)$/)) return 'js';
    if (pathname.match(/\.(jpg|jpeg|png|gif|webp|svg|ico)$/)) return 'images';
    if (pathname.match(/\.(woff|woff2|ttf|eot)$/)) return 'fonts';
    
    return 'pages';
}

/**
 * Handle request with specified strategy
 */
async function handleRequest(request, strategy, resourceType) {
    try {
        switch (strategy) {
            case 'cacheFirst':
                return await cacheFirst(request, resourceType);
            case 'networkFirst':
                return await networkFirst(request, resourceType);
            case 'staleWhileRevalidate':
                return await staleWhileRevalidate(request, resourceType);
            default:
                return await networkFirst(request, resourceType);
        }
    } catch (error) {
        console.error('Request handling failed:', error);
        return await handleOffline(request, resourceType);
    }
}

/**
 * Cache First strategy - check cache first, then network
 */
async function cacheFirst(request, resourceType) {
    const cacheName = getCacheName(resourceType);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        // Check if cached response is still fresh
        if (isCacheFresh(cachedResponse, resourceType)) {
            return cachedResponse;
        }
    }
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            // Clone response for cache
            const responseClone = networkResponse.clone();
            await cache.put(request, responseClone);
        }
        
        return networkResponse;
    } catch (error) {
        if (cachedResponse) {
            return cachedResponse;
        }
        throw error;
    }
}

/**
 * Network First strategy - try network first, fallback to cache
 */
async function networkFirst(request, resourceType) {
    const cacheName = getCacheName(resourceType);
    
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(cacheName);
            const responseClone = networkResponse.clone();
            await cache.put(request, responseClone);
        }
        
        return networkResponse;
    } catch (error) {
        const cache = await caches.open(cacheName);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Stale While Revalidate strategy - return cache immediately, update in background
 */
async function staleWhileRevalidate(request, resourceType) {
    const cacheName = getCacheName(resourceType);
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    // Start network request in background
    const networkResponsePromise = fetch(request).then(response => {
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    }).catch(() => {
        // Ignore network errors in background update
    });
    
    // Return cached response immediately if available
    if (cachedResponse) {
        // Start background update
        networkResponsePromise;
        return cachedResponse;
    }
    
    // If no cache, wait for network
    return await networkResponsePromise;
}

/**
 * Handle offline scenarios
 */
async function handleOffline(request, resourceType) {
    const url = new URL(request.url);
    
    // For pages, show offline page
    if (resourceType === 'pages') {
        const cache = await caches.open(STATIC_CACHE);
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) {
            return offlinePage;
        }
    }
    
    // For images, return placeholder if available
    if (resourceType === 'images') {
        const cache = await caches.open(IMAGE_CACHE);
        const placeholder = await cache.match('/images/placeholder.svg');
        if (placeholder) {
            return placeholder;
        }
    }
    
    // Return generic offline response
    return new Response('Offline', {
        status: 503,
        statusText: 'Service Unavailable',
        headers: { 'Content-Type': 'text/plain' }
    });
}

/**
 * Get appropriate cache name for resource type
 */
function getCacheName(resourceType) {
    switch (resourceType) {
        case 'images':
            return IMAGE_CACHE;
        case 'css':
        case 'js':
        case 'fonts':
            return STATIC_CACHE;
        default:
            return DYNAMIC_CACHE;
    }
}

/**
 * Check if cached response is still fresh
 */
function isCacheFresh(response, resourceType) {
    const cacheDate = response.headers.get('date');
    if (!cacheDate) return false;
    
    const maxAge = CACHE_DURATIONS[resourceType] || CACHE_DURATIONS.dynamic;
    const age = (Date.now() - new Date(cacheDate).getTime()) / 1000;
    
    return age < maxAge;
}

/**
 * Background sync for failed requests
 */
self.addEventListener('sync', event => {
    if (event.tag === 'background-sync') {
        event.waitUntil(
            doBackgroundSync()
        );
    }
});

/**
 * Perform background sync
 */
async function doBackgroundSync() {
    try {
        // Retry failed requests stored in IndexedDB
        console.log('Performing background sync...');
        // Implementation would depend on specific requirements
    } catch (error) {
        console.error('Background sync failed:', error);
    }
}

/**
 * Push notification handling
 */
self.addEventListener('push', event => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/images/smartpetbuys_logo.png',
        badge: '/images/badge.png',
        data: data.data,
        actions: data.actions
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/**
 * Notification click handling
 */
self.addEventListener('notificationclick', event => {
    event.notification.close();
    
    const urlToOpen = event.notification.data?.url || '/';
    
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(clientList => {
            // If a window is already open, focus it
            for (const client of clientList) {
                if (client.url === urlToOpen && 'focus' in client) {
                    return client.focus();
                }
            }
            
            // Otherwise, open a new window
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen);
            }
        })
    );
});

/**
 * Message handling for communication with main thread
 */
self.addEventListener('message', event => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
        case 'GET_VERSION':
            event.ports[0].postMessage({ version: CACHE_VERSION });
            break;
        case 'CLEAR_CACHE':
            clearAllCaches();
            break;
        default:
            console.log('Unknown message type:', type);
    }
});

/**
 * Clear all caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
    );
    console.log('All caches cleared');
}