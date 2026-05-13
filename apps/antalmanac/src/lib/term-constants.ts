import { z } from 'zod';

export const REGULAR_QUARTERS = ['Fall', 'Winter', 'Spring'] as const;
export const SUMMER_QUARTERS = ['Summer1', 'Summer2', 'Summer10wk'] as const;
export const QUARTERS = [...REGULAR_QUARTERS, ...SUMMER_QUARTERS] as const;

export type Quarter = (typeof QUARTERS)[number];
export const QuarterSchema = z.enum(QUARTERS);

export const QUARTER_LONG_NAMES = {
    Fall: 'Fall Quarter',
    Winter: 'Winter Quarter',
    Spring: 'Spring Quarter',
    Summer1: 'Summer Session 1',
    Summer2: 'Summer Session 2',
    Summer10wk: '10-wk Summer',
} as const satisfies Record<Quarter, string>;

export function isSummerQuarter(quarter: Quarter): boolean {
    return (SUMMER_QUARTERS as readonly string[]).includes(quarter);
}

export function buildTermShortName(year: string | number, quarter: Quarter): `${string} ${Quarter}` {
    return `${year} ${quarter}`;
}

export function parseTermShortName(term: string): { year: string; quarter: Quarter } | null {
    const spaceIdx = term.indexOf(' ');
    if (spaceIdx === -1) {
        return null;
    }

    const result = QuarterSchema.safeParse(term.slice(spaceIdx + 1));
    if (!result.success) {
        return null;
    }

    return { year: term.slice(0, spaceIdx), quarter: result.data };
}
