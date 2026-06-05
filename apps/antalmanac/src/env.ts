import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { createEnv } from '@t3-oss/env-nextjs';
import { config } from 'dotenv';
import { z } from 'zod';

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({ path: resolve(appRoot, '.env') });

export const env = createEnv({
    server: {
        DB_URL: z.string().min(1),
        ANTEATER_API_KEY: z.string().min(1),
        OIDC_CLIENT_ID: z.string().min(1),
        OIDC_ISSUER_URL: z.string().min(1),
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.string().min(1),
        MAPBOX_ACCESS_TOKEN: z.string().min(1).optional(),
        PLANNER_CLIENT_API_KEY: z.string().min(1).optional(),
        STAGE: z.string().min(1),
    },
    client: {
        NEXT_PUBLIC_TILES_ENDPOINT: z.string().min(1).optional(),
        NEXT_PUBLIC_PUBLIC_POSTHOG_KEY: z.string().min(1).optional(),
        NEXT_PUBLIC_PUBLIC_POSTHOG_HOST: z.string().min(1).optional(),
        NEXT_PUBLIC_ENDPOINT: z.string().min(1).optional(),
        NEXT_PUBLIC_LOCAL_SERVER: z.string().min(1).optional(),
        NEXT_PUBLIC_BASE_URL: z.string().min(1).optional(),
    },
    runtimeEnv: {
        DB_URL: process.env.DB_URL,
        MAPBOX_ACCESS_TOKEN: process.env.MAPBOX_ACCESS_TOKEN,
        ANTEATER_API_KEY: process.env.ANTEATER_API_KEY,
        OIDC_CLIENT_ID: process.env.OIDC_CLIENT_ID,
        OIDC_ISSUER_URL: process.env.OIDC_ISSUER_URL,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL,
        PLANNER_CLIENT_API_KEY: process.env.PLANNER_CLIENT_API_KEY,
        STAGE: process.env.STAGE,
        NEXT_PUBLIC_TILES_ENDPOINT: process.env.NEXT_PUBLIC_TILES_ENDPOINT,
        NEXT_PUBLIC_PUBLIC_POSTHOG_KEY: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY,
        NEXT_PUBLIC_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
        NEXT_PUBLIC_ENDPOINT: process.env.NEXT_PUBLIC_ENDPOINT,
        NEXT_PUBLIC_LOCAL_SERVER: process.env.NEXT_PUBLIC_LOCAL_SERVER,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    },
    emptyStringAsUndefined: true,
});
