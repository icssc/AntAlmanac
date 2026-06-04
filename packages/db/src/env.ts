import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEnv } from '@t3-oss/env-core';
import { config } from 'dotenv';
import { z } from 'zod';

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(packageRoot, '.env') });

export const env = createEnv({
    server: {
        DB_URL: z.string().min(1),
    },
    runtimeEnv: {
        DB_URL: process.env.DB_URL,
    },
    emptyStringAsUndefined: true,
});
