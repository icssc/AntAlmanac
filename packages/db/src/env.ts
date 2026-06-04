import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        DB_URL: z.string().min(1),
    },
    runtimeEnv: {
        DB_URL: process.env.DB_URL,
    },
    emptyStringAsUndefined: true,
});
