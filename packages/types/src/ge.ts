import type { GE } from '@packages/anteater-api/types';
import { z } from 'zod';

export const GE_CATEGORY_VALUES = [
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
] as const satisfies readonly GE[];

export const GeSearchValueSchema = z.enum(GE_CATEGORY_VALUES);

export type GeSearchValue = z.infer<typeof GeSearchValueSchema>;

export const GeCategorySchema = z.enum([...GE_CATEGORY_VALUES, 'ANY'] as const satisfies readonly GE[]);

export type GeCategory = z.infer<typeof GeCategorySchema>;
