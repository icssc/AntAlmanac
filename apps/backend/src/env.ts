import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();


/**
 * Environment variables required by the backend during deploy time.
 */
export const deployEnvSchema = z.object({
    DB_URL: z.string(),
    STAGE: z.string(),
    MAPBOX_ACCESS_TOKEN: z.string(),
})

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
 * Environment variables required by the backend to connect to the PeterPortal API.
 */
export const peterPortalSchema = z.object({
    PETERPORTAL_API_KEY: z.string(),
});

/**
 * Environment variables required by the backend during runtime.
 */
export const backendEnvSchema = [
    rdsEnvSchema, mapboxEnvSchema, googleOAuthEnvSchema, peterPortalSchema
].reduce(
    (acc, schema) => acc.merge(schema), z.object({STAGE: z.string()})
);
