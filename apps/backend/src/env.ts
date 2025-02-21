import { z } from 'zod';
import * as dotenv from 'dotenv';

dotenv.config();

export const googleOAuthEnvSchema = z.object({
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
    GOOGLE_REDIRECT_URI: z.string(),
});
/**
 * Environment variables required by the backend during deploy time.
 */
export const deployEnvSchema = z.object({
    DB_URL: z.string(),
    STAGE: z.string(),
    MAPBOX_ACCESS_TOKEN: z.string(),
});

/**
 * Environment variables required by the backend to connect to the RDS instance.
 */
export const rdsEnvSchema = z.object({
    DB_URL: z.string(),
    NODE_ENV: z.string().optional(),
});

/**
 * Environment variables required by the backend to connect to the DynamoDB table.
 *
 * This will be removed once we complete migration to RDS.
 */
export const ddbEnvSchema = z.object({
    USERDATA_TABLE_NAME: z.string(),
    AWS_REGION: z.string(),
    NODE_ENV: z.string().optional(),
});

/**
 * Environment variables required by the backend during runtime.
 */
export const backendEnvSchema = z.intersection(deployEnvSchema, rdsEnvSchema, googleOAuthEnvSchema);
