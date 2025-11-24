import type { MetadataRoute } from 'next';

import { BLUE } from '$src/globals';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'AntAlmanac',
        description: 'A Progressive Web App for AntAlmanac',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: BLUE,
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
    };
}
