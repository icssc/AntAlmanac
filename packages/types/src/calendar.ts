import type { Quarter } from '@packages/anteater-api/types';
import { z } from 'zod';

export const QUARTERS = [
    'Fall',
    'Winter',
    'Spring',
    'Summer1',
    'Summer10wk',
    'Summer2',
] as const satisfies readonly Quarter[];

export const QuarterSchema = z.enum(QUARTERS);

export type AATerm = {
    year: string;
    quarter: Quarter;
    shortName: `${string} ${Quarter}`;
    longName: string;
    instructionStart: Date;
    instructionEnd: Date;
    finalsStart: Date;
    finalsEnd: Date;
    socAvailable: Date;
    isSummerTerm: boolean;
};
