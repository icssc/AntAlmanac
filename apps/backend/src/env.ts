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
 * Environment variables required by the backend during runtime.
 */
export const backendEnvSchema = [
    rdsEnvSchema, mapboxEnvSchema, googleOAuthEnvSchema
].reduce((acc, schema) => acc.merge(schema), z.object({}));
