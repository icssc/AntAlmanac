import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
    server: {
        DB_URL: z.string().min(1),
        ANTEATER_API_KEY: z.string().min(1),
        OIDC_CLIENT_ID: z.string().min(1),
        OIDC_ISSUER_URL: z.string().min(1),
        BETTER_AUTH_SECRET: z.string().min(1),
        BETTER_AUTH_URL: z.string().min(1),
        MAPBOX_ACCESS_TOKEN: z.string().min(1).optional(),
        /** Anteater API base URL used by the Planner backend (with trailing slash). */
        PUBLIC_API_URL: z.string().min(1).default('https://anteaterapi.com/v2/rest/'),
        /** JSON array of emails allowed to use the Planner admin pages. */
        ADMIN_EMAILS: z.string().min(1).optional(),
        /** Bearer secret for the Planner external API (`external.roadmaps.getByEmail`). */
        EXTERNAL_USER_READ_SECRET: z.string().min(1).optional(),
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
        PUBLIC_API_URL: process.env.PUBLIC_API_URL,
        ADMIN_EMAILS: process.env.ADMIN_EMAILS,
        EXTERNAL_USER_READ_SECRET: process.env.EXTERNAL_USER_READ_SECRET,
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
