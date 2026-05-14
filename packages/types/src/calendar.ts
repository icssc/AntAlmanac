import type { CalendarTerm, Quarter } from '@packages/anteater-api/types';

export type AATerm = CalendarTerm & {
    shortName: `${string} ${Quarter}`;
    longName: string;
    isSummerTerm: boolean;
};
