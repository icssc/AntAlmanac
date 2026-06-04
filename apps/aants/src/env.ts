import 'dotenv/config';
import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        DB_URL: z.string().min(1),
        QUEUE_URL: z.string().min(1),
        ANTEATER_API_KEY: z.string().min(1),
        STAGE: z.string().default('local'),
        NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
    },
    runtimeEnv: {
        DB_URL: process.env.DB_URL,
        QUEUE_URL: process.env.QUEUE_URL,
        ANTEATER_API_KEY: process.env.ANTEATER_API_KEY,
        STAGE: process.env.STAGE,
        NODE_ENV: process.env.NODE_ENV,
    },
    emptyStringAsUndefined: true,
    skipValidation: process.env.SKIP_ENV_VALIDATION === 'true',
});
