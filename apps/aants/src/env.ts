import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { stageSchema } from '@packages/antalmanac-types';
import { createEnv } from '@t3-oss/env-core';
import { config } from 'dotenv';
import { z } from 'zod';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(packageRoot, '.env') });

export const env = createEnv({
    server: {
        DB_URL: z.string().min(1),
        QUEUE_URL: z.string().min(1),
        ANTEATER_API_KEY: z.string().min(1),
        STAGE: stageSchema,
        NODE_ENV: z.enum(['development', 'production']).optional(),
    },
    runtimeEnv: {
        DB_URL: process.env.DB_URL,
        QUEUE_URL: process.env.QUEUE_URL,
        ANTEATER_API_KEY: process.env.ANTEATER_API_KEY,
        STAGE: process.env.STAGE,
        NODE_ENV: process.env.NODE_ENV,
    },
    emptyStringAsUndefined: true,
});
