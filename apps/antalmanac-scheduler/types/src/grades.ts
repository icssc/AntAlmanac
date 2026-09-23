import type { GE } from '@packages/anteater-api/types';
import { z } from 'zod';

export const GradesGeSchema = z.enum([
    'GE-1A',
    'GE-1B',
    'GE-2',
    'GE-3',
    'GE-4',
    'GE-5A',
    'GE-5B',
    'GE-6',
    'GE-7',
    'GE-8',
    'ANY',
] as const satisfies readonly GE[]);
