import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    {
        root: 'apps/antalmanac',
        extends: 'apps/antalmanac/vitest.config.ts',
    },
]);
