import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { defineConfig } from 'vitest/config';

const rootDir = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
    resolve: {
        alias: {
            $actions: resolve(rootDir, './src/actions'),
            $backend: resolve(rootDir, './src/backend'),
            $components: resolve(rootDir, './src/components'),
            $generated: resolve(rootDir, './src/generated'),
            $hooks: resolve(rootDir, './src/hooks'),
            $lib: resolve(rootDir, './src/lib'),
            $providers: resolve(rootDir, './src/providers'),
            $src: resolve(rootDir, './src'),
            $stores: resolve(rootDir, './src/stores'),
            $scripts: resolve(rootDir, './scripts'),
        },
    },
    test: {
        environment: 'jsdom',
        globals: true,
        setupFiles: [resolve(rootDir, './tests/setup/setup.ts')],
    },
});
