import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment variables required by the backend for OIDC authentication.
 */
export const oidcEnvSchema = z.object({
    OIDC_CLIENT_ID: z.string().default('antalmanac'),
    GOOGLE_REDIRECT_URI: z.string(),
    OIDC_ISSUER_URL: z.string(),
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
 * Environment variables required by the backend during runtime.
 */
export const backendEnvSchema = z
    .object({ STAGE: z.string() })
    .merge(oidcEnvSchema)
    .merge(rdsEnvSchema)
    .merge(mapboxEnvSchema)
    .merge(aapiEnvSchema);
