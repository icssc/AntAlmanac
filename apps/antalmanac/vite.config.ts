import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
    plugins: [
        react(),
        svgr(),
        VitePWA({
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            devOptions: {
                enabled: true,
            },
            includeAssets: ['favicon.ico', 'apple-touch-icon.png'], // may need mask-icon.svg
            injectManifest: {
                globPatterns: ['**/*.{html,js,css,png,svg,jpg,json}'], // Match files for pre-caching
            },
            manifest: {
                name: 'AntAlmanac',
                short_name: 'AntAlmanac',
                description: 'A course exploration and scheduling tool for UCI Anteaters',
                theme_color: '#305db7',
                icons: [
                    {
                        src: 'logo-192.png',
                        sizes: '192x192',
                        type: 'image/png',
                    },
                    {
                        src: 'logo-512.png',
                        sizes: '512x512',
                        type: 'image/png',
                    },
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            $assets: resolve(__dirname, './src/assets'),
            $actions: resolve(__dirname, './src/actions'),
            $api: resolve(__dirname, './src/api'),
            $components: resolve(__dirname, './src/components'),
            $lib: resolve(__dirname, './src/lib'),
            $providers: resolve(__dirname, './src/providers'),
            $routes: resolve(__dirname, './src/routes'),
            $stores: resolve(__dirname, './src/stores'),
        },
    },
    build: {
        outDir: 'build',
    },
    server: {
        host: 'localhost',
    },
    // @ts-expect-error
    test: {
        environment: 'jsdom',
        setupFiles: [resolve(__dirname, 'tests/setup/setup.ts')],
    },
});
