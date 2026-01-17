import * as dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '../.env' });

/**
 * Environment variables required by the backend to connect to the RDS instance.
 */
export const aantsEnvSchema = z.object({
    DB_URL: z.string(),
    NODE_ENV: z.string().optional(),
});
