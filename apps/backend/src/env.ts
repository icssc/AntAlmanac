import {z} from "zod";
import * as dotenv from "dotenv";

dotenv.config();


/**
 * Environment variables required by the backend during deploy time.
 */
export const deployEnvSchema = z.object({
    DB_URL: z.string(),
    STAGE: z.string(),
    MAPBOX_ACCESS_TOKEN: z.string(),
})

/**
 * Environment variables required by the backend during runtime.
 */
export const backendEnvSchema = z.intersection(deployEnvSchema, z.object({
    USERDATA_TABLE_NAME: z.string(),
    AWS_REGION: z.string(),
    NODE_ENV: z.string().optional(),
}))
