import type { MetadataRoute } from 'next';

import { BLUE } from '$src/globals';

export default function manifest(): MetadataRoute.Manifest {
    return {
        id: 'https://antalmanac.com',
        scope: 'https://antalmanac.com',
        name: 'AntAlmanac',
        description: 'A course exploration and scheduling tool for UCI Anteaters',
        lang: 'en',
        dir: 'ltr',
        start_url: '/',
        display: 'standalone',
        theme_color: BLUE,
        background_color: BLUE,
        orientation: 'portrait',
        categories: ['education', 'productivity', 'utilities'],
        icons: [
            {
                src: '/icons/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icons/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
        screenshots: [
            {
                src: '/screenshots/desktop.png',
                sizes: '1280x630',
                type: 'image/png',
                form_factor: 'wide',
                label: 'Schedule and course search',
            },
            // Add iphone screenshots (with graphics?)
        ],
    };
}
