import type { Quarter } from '@packages/anteater-api/types';

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
