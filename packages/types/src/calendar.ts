import type { Quarter, Year } from '@packages/anteater-api/types';
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
    year: Year;
    quarter: Quarter;
    shortName: `${Year} ${Quarter}`;
    longName: string;
    instructionStart: Date;
    instructionEnd: Date;
    finalsStart: Date;
    finalsEnd: Date;
    socAvailable: Date;
    isSummerTerm: boolean;
};
