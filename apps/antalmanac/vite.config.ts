import { resolve } from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

export default defineConfig({
    plugins: [react(), svgr()],
    resolve: {
        alias: {
            $assets: resolve(__dirname, './src/assets'),
            $actions: resolve(__dirname, './src/actions'),
            $api: resolve(__dirname, './src/api'),
            $components: resolve(__dirname, './src/components'),
            $generated: resolve(__dirname, './src/generated'),
            $lib: resolve(__dirname, './src/lib'),
            $providers: resolve(__dirname, './src/providers'),
            $routes: resolve(__dirname, './src/routes'),
            $src: resolve(__dirname, './src'),
            $stores: resolve(__dirname, './src/stores'),
            $hooks: resolve(__dirname, './src/hooks'),
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
