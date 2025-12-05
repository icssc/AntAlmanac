import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

export const googleOAuthEnvSchema = z.object({
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
});

/**
 * Environment variables required by the backend to connect to the RDS instance.
 */
export const rdsEnvSchema = z.object({
    DB_URL: z.string(),
});

/**
 * Environment variables required by the backend to connect to the Mapbox API.
 */
export const mapboxEnvSchema = z.object({
    MAPBOX_ACCESS_TOKEN: z.string(),
});

/**
 * Environment variables required by the backend to connect to the Anteater API.
 */
export const aapiEnvSchema = z.object({
    ANTEATER_API_KEY: z.string(),
});

/**
 * Environment variables required by the backend to connect to the PeterPortal API.
 */
export const ppEnvSchema = z.object({
    PETERPORTAL_CLIENT_API_KEY: z.string(),
});

/**
 * Environment variables required by the backend during runtime.
 */
export const backendEnvSchema = z
    .object({ STAGE: z.string() })
    .merge(googleOAuthEnvSchema)
    .merge(rdsEnvSchema)
    .merge(mapboxEnvSchema)
    .merge(aapiEnvSchema);
