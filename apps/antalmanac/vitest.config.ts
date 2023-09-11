import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    resolve: {
        alias: {
            $actions: resolve(__dirname, './src/actions'),
            $api: resolve(__dirname, './src/api'),
            $components: resolve(__dirname, './src/components'),
            $lib: resolve(__dirname, './src/lib'),
            $providers: resolve(__dirname, './src/providers'),
            $routes: resolve(__dirname, './src/routes'),
            $stores: resolve(__dirname, './src/stores'),
        },
    },
    test: {
        environment: 'jsdom',
        // setupFiles: './tests/setup.ts',
    },
});
