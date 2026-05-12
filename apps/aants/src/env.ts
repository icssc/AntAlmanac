import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../.env' });

export const aantsEnvSchema = z.object({
    NODE_ENV: z.string().optional(),
    /** Environment tier — required so DB queries filter to the correct row set. */
    STAGE: z.string(),
    /** Postgres connection string for the RDS instance. */
    DB_URL: z.string(),
    /** SQS queue URL for the email worker. */
    QUEUE_URL: z.string(),
    /** Anteater API key for WebSoc queries. */
    ANTEATER_API_KEY: z.string(),
});

/** Parsed and validated runtime environment. Import this instead of accessing process.env directly. */
export const env = aantsEnvSchema.parse(process.env);
