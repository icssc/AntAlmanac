import * as dotenv from "dotenv";
import { z } from "zod";

dotenv.config({ path: "../.env" });

/**
 * Environment variables required by aants to connect to the RDS instance.
 */
const rdsEnvSchema = z.object({
    DB_URL: z.string(),
});

/**
 * Environment variables required by aants for the email SQS queue.
 */
const queueEnvSchema = z.object({
    QUEUE_URL: z.string(),
});

/**
 * Environment variables required by aants during runtime.
 */
export const aantsEnvSchema = z
    .object({
        NODE_ENV: z.string().optional(),
        STAGE: z.string().optional(),
    })
    .merge(rdsEnvSchema)
    .merge(queueEnvSchema);
