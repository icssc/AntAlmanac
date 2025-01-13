import { clientsClaim } from 'workbox-core';
import { registerRoute, setCatchHandler, NavigationRoute } from 'workbox-routing';
import { precacheAndRoute, createHandlerBoundToURL } from 'workbox-precaching';

import { TILES_URL } from '$lib/api/endpoints';
import { request } from 'http';

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
const matchCbMap = ({ url }) => {
    console.log('Matching URL:', url); // Add this line to check if the correct URLs are being matched
    return (
        url.origin === `https://${TILES_URL}` ||
        url.origin === 'https://d32w28pcyzk3qf.cloudfront.net' ||
        url.origin === 'https://tile.openstreetmap.org'
    );
};

const matchCbUserData = ({ url }) => {
    console.log('Matching URL:', url); // Add this line to check if the correct URLs are being matched
    return (
        url.href.startsWith('https://cors-anywhere.herokuapp.com/https://api.antalmanac.com/trpc/users.getUserData') ||
        url.origin === 'https://api.antalmanac.com/trpc/users.getUserData' ||
        url.href.startsWith(
            'https://cors-anywhere.herokuapp.com/https://api.antalmanac.com/trpc/websoc.getCourseInfo'
        ) ||
        url.origin === 'https://api.antalmanac.com/trpc/websoc.getCourseInfo'
    );
};

// Custom handler for tile requests
const handlerCbMap = async ({ request }) => {
    console.log('Fetching tile:', request.url);

    const openUrl = new URL(request.url); // Use request.url here
    openUrl.origin = 'https://d32w28pcyzk3qf.cloudfront.net'; // Corrected line

    const modifiedRequest = new Request(openUrl.toString(), {
        method: request.method,
        headers: request.headers,
    });
    console.log('Modified request:', modifiedRequest.url);

    // Use the cloned request with its default headers
    try {
        console.log('Attempting to fetch tile from network:', modifiedRequest.url);
        const response = await fetch(modifiedRequest);

        // Debugging the response status
        console.log('Tile fetch status:', response ? response.status : 'No response');

        // Check if the response is successful
        if (!response.ok) {
            console.error('Failed to fetch image from network, status code:', response.status);
            throw new Error(`Failed to fetch image: ${response.status}`);
        }

        console.log('Successfully fetched tile from network:', request.url);

        // Step 2: Cache the tile after fetching it from the network
        const cache = await caches.open('tiles-cache');
        console.log('Opened cache for tiles: tiles-cache');

        // Store the response in cache for future use
        await cache.put(request, response.clone());
        console.log('Tile cached successfully in tiles-cache:', request.url);

        // Return the network response
        console.log('Returning network response for tile:', request.url);
        return response;
    } catch (error) {
        // Step 3: If the network request fails, log and serve the fallback image
        console.error('Network request failed for tile, error:', error.message);

        // Try to serve fallback image from custom fallback-cache
        console.log('Attempting to serve fallback image from fallback-cache');
        const fallbackResponse = await caches.match('/fallback.png', { cacheName: 'fallback-cache' });
        if (fallbackResponse) {
            console.log('Found fallback image in fallback-cache, returning it');
            return fallbackResponse;
        } else {
            console.warn('Fallback image not found in fallback-cache');
        }

        // If all attempts fail, log the error and return a generic error response
        console.error('All fallback methods failed, returning error response');
        return new Response('Fallback image not available', { status: 500 });
    }
};

const handlerCbUserData = async ({ request }) => {
    console.log('Fetching user data:', request.url);

    try {
        const response = await fetch(request);

        if (!response.ok) {
            console.error('Failed to fetch user data from network, status code:', response.status);
            throw new Error(`Failed to fetch user data: ${response.status}`);
        }

        console.log('Successfully fetched user data from network:', request.url);

        const cache = await caches.open('schedule-cache');
        console.log('Opened cache for user data: schedule-cache');

        await cache.put(request, response.clone());
        console.log('User data cached successfully in schedule-cache:', request.url);

        console.log('Returning network response for user data:', request.url);
        return response;
    } catch (error) {
        console.error('Network request failed for user data, error:', error.message);

        const fallbackResponse = await caches.match(request, { cacheName: 'schedule-cache' });
        if (fallbackResponse) {
            console.log('Found user data in schedule-cache, returning it');
            return fallbackResponse;
        } else {
            console.warn('User data not found in schedule-cache');
        }

        console.error('All fallback methods failed, returning error response');
        return new Response('Failed to fetch user data', { status: 500 });
    }
};

// Register the route for tile requests
registerRoute(matchCbMap, handlerCbMap);
registerRoute(matchCbUserData, handlerCbUserData);

// Debugging cache state
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            console.log('Cache names:', cacheNames);
        })
    );
});

// Precache the fallback image manually in a separate cache (fallback-cache)
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('fallback-cache').then((cache) => {
            console.log('Opening fallback-cache and adding fallback image');
            return cache.add('/fallback.png'); // Add the fallback image here manually
        })
    );
});
