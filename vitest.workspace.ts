import { defineWorkspace } from 'vitest/config';

export default defineWorkspace([
    {
        root: 'apps/antalmanac-scheduler/site',
        extends: 'apps/antalmanac-scheduler/site/vitest.config.ts',
    },
]);
