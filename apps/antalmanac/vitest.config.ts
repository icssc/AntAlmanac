import { resolve } from 'node:path';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            $actions: resolve(__dirname, './src/actions'),
            $backend: resolve(__dirname, './src/backend'),
            $components: resolve(__dirname, './src/components'),
            $generated: resolve(__dirname, './src/generated'),
            $hooks: resolve(__dirname, './src/hooks'),
            $lib: resolve(__dirname, './src/lib'),
            $providers: resolve(__dirname, './src/providers'),
            $scripts: resolve(__dirname, './scripts'),
            $src: resolve(__dirname, './src'),
            $stores: resolve(__dirname, './src/stores'),
        },
    },
    test: {
        environment: 'jsdom',
        setupFiles: [resolve(__dirname, 'tests/setup/setup.ts')],
    },
});
