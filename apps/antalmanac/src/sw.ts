import { clientsClaim } from 'workbox-core';
import { registerRoute, setCatchHandler, NavigationRoute } from 'workbox-routing';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';
import { TILES_URL } from '$lib/api/endpoints';

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
setCatchHandler(async ({ event }: { event: any }) => {
    if (event.request.destination === 'document') {
        const cachedResponse = await caches.match('/index.html'); // Serve the app shell for navigation requests
        return cachedResponse || Response.error();
    }
    return Response.error();
});

// Match tile requests (e.g., https://${TILES_URL}/{z}/{x}/{y}.png)
const matchCbMap = ({ url }: { url: any }) => {
    return import.meta.env.MODE === 'development'
        ? url.origin === 'https://d32w28pcyzk3qf.cloudfront.net'
        : url.origin === `https://${TILES_URL}`;
};

const matchCbUserData = ({ url }: { url: any }) => {
    if (import.meta.env.MODE === 'development') {
        return (
            url.origin === 'https://dev.api.antalmanac.com/trpc/users.getUserData' ||
            url.origin === 'https://dev.api.antalmanac.com/trpc/websoc.getCourseInfo'
        );
    } else {
        return (
            url.origin === 'https://api.antalmanac.com/trpc/users.getUserData' ||
            url.origin === 'https://api.antalmanac.com/trpc/websoc.getCourseInfo'
        );
    }
};

const handlerCbMap = async ({ request }: { request: any }) => {
    try {
        const response = await fetch(request);

        if (!response.ok) {
            console.error('Failed to fetch image from network, status code:', response.status);
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        const cache = await caches.open('tiles-cache');
        await cache.put(request, response.clone());

        return response;
    } catch (error: any) {
        // If the network request fails, log and serve the fallback image
        console.error('Network request failed for tile, error:', error.message);

        const fallbackResponse = await caches.match('/fallback.png', { cacheName: 'fallback-cache' });

        if (fallbackResponse) {
            return fallbackResponse;
        } else {
            console.warn('Fallback image not found in fallback-cache');
            console.error('All fallback methods failed, returning error response');
            return new Response('Fallback image not available', { status: 500 });
        }
    }
};

const handlerCbUserData = async ({ request }: { request: any }) => {
    try {
        const response = await fetch(request);
        if (!response.ok) {
            console.error('Failed to fetch user data from network, status code:', response.status);
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        const cache = await caches.open('schedule-cache');
        await cache.put(request, response.clone());

        return response;
    } catch (error: any) {
        console.error('Network request failed for user data, error:', error.message);

        const fallbackResponse = await caches.match(request, { cacheName: 'schedule-cache' });

        if (fallbackResponse) {
            console.log('Found user data in schedule-cache, returning it');
            return fallbackResponse;
        } else {
            console.warn('User data not found in schedule-cache');
            console.error('All fallback methods failed, returning error response');
            return new Response('Failed to fetch user data', { status: 500 });
        }
    }
};

registerRoute(matchCbMap, handlerCbMap);
registerRoute(matchCbUserData, handlerCbUserData);

// Precache the maps fallback image manually in a separate cache (fallback-cache)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('fallback-cache').then((cache) => {
            return cache.add('/fallback.png');
        })
    );
});
