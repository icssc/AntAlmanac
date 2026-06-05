import { z } from 'zod';

/**
 * Environment tag for AANTS subscription routing.
 * Must match between antalmanac and aants for a given deployment.
 * SST sets `STAGE` explicitly in deployed environments; `local` is the dev fallback.
 */
export const stageSchema = z.string().trim().min(1).default('local');
