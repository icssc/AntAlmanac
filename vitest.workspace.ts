import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    {
        root: 'apps/antalmanac',
        extends: 'apps/antalmanac/vite.config.ts',
        test: {
            environment: 'jsdom',
            globals: true,
        },
    },
]);
