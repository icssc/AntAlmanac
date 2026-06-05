import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEnv } from '@t3-oss/env-nextjs';
import { config } from 'dotenv';
import { z } from 'zod';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(appRoot, '.env') });

export const scriptEnv = createEnv({
    server: {
        ANTEATER_API_KEY: z.string().min(1),
    },
    runtimeEnv: {
        ANTEATER_API_KEY: process.env.ANTEATER_API_KEY,
    },
    emptyStringAsUndefined: true,
});
