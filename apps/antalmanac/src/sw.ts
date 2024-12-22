import { clientsClaim } from 'workbox-core';
import { registerRoute, setCatchHandler, NavigationRoute } from 'workbox-routing';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';

// Ensure TypeScript recognizes Service Worker globals
declare let self: ServiceWorkerGlobalScope;

// Injected by Workbox during build
precacheAndRoute(self.__WB_MANIFEST); // Automatically precaches all assets, including fallback.png

// Handle navigation requests by falling back to `index.html`
registerRoute(new NavigationRoute(createHandlerBoundToURL('/index.html')));

// Ensure the service worker takes control of the page immediately
self.skipWaiting();
clientsClaim();

// Fallback for document requests (e.g., offline or missing resources)
setCatchHandler(({ event }) => {
    console.log('Catch handler triggered for', event.request.url);
    if (event.request.destination === 'document') {
        return caches.match('/index.html'); // Serve the app shell for navigation requests
    }

    return Response.error();
});

// Match tile requests (e.g., https://${TILES_URL}/{z}/{x}/{y}.png)
const matchCb = ({ url }) => {
    return url.origin === 'https://tile.openstreetmap.org';
};

// Custom handler for tile requests
const handlerCb = async ({ request }) => {
    console.log('Fetching tile:', request.url);
    try {
        // Attempt to fetch the tile image from the network
        const response = await fetch(request);

        // Log the response status for debugging
        console.log('Tile fetch status:', response ? response.status : 'No response');

        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        // Return the network response if successful
        return response;
    } catch (error) {
        // If the network request fails, log and serve the fallback image
        console.error('Network request failed for tile, serving fallback image:', error);
        return caches.match('fallback.png'); // Ensure this fallback is available in the cache
    }
};

// Register the route for tile requests
registerRoute(matchCb, handlerCb);

// Debugging cache state
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            console.log('Cache names:', cacheNames);
        })
    );
});
