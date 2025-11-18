import { createEnv } from '@t3-oss/env-core';
import { z } from 'zod';

export const env = createEnv({
    server: {
        // Database
        DATABASE_URL: z.string().url(),

        // OAuth
        OIDC_CLIENT_ID: z.string().min(1),
        OIDC_ISSUER_URL: z.string().url(),
        GOOGLE_OAUTH_REDIRECT_URI: z.string().url(),

        // API Keys
        ANTEATER_API_KEY: z.string().optional(),
        MAPBOX_ACCESS_TOKEN: z.string().min(1),

        // Runtime Environment
        STAGE: z.string().optional(),
        NODE_ENV: z.enum(['development', 'production', 'test']).optional(),
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
});
