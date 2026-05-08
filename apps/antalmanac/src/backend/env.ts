import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

/**
 * Environment variables required for OIDC OAuth.
 */
export const oidcOAuthEnvSchema = z.object({
    OIDC_CLIENT_ID: z.string(),
    OIDC_ISSUER_URL: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
});

/**
 * Environment variables for Sign in with Apple.
 *
 * - APPLE_CLIENT_ID: the Services ID (web) registered in the Apple Developer portal.
 * - APPLE_BUNDLE_ID: the iOS app bundle ID (tokens issued to the native app use this as audience).
 *
 * Both are optional — Sign in with Apple is only enabled when at least one is set.
 */
export const appleAuthEnvSchema = z.object({
    APPLE_CLIENT_ID: z.string().optional(),
    APPLE_BUNDLE_ID: z.string().optional(),
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
 * Environment variables required by the backend to connect to the Planner API.
 */
export const plannerEnvSchema = z.object({
    PLANNER_CLIENT_API_KEY: z.string(),
});

/**
 * STAGE: "production" on production; staging instance on staging (e.g. "staging-1337").
 * Used to set subscription.environment so only that AANTS instance sends emails.
 */
export const stagingEnvSchema = z.object({
    STAGE: z.string().optional(),
});

/**
 * Environment variables required by the backend during runtime.
 */
export const backendEnvSchema = z
    .object({})
    .merge(stagingEnvSchema)
    .merge(oidcOAuthEnvSchema)
    .merge(appleAuthEnvSchema)
    .merge(rdsEnvSchema)
    .merge(mapboxEnvSchema)
    .merge(aapiEnvSchema)
    .merge(plannerEnvSchema);
