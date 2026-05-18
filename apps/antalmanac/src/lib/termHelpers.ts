import { QuarterSchema } from '@packages/antalmanac-types';
import type { Quarter, Year } from '@packages/anteater-api/types';

export type TermParts = { year: Year; quarter: Quarter };

export function parseTermShortName(shortName: string): TermParts | undefined {
    const parts = shortName.split(' ');
    if (parts.length !== 2) return undefined;
    const [year, rawQuarter] = parts;
    const result = QuarterSchema.safeParse(rawQuarter);
    if (!result.success) return undefined;
    return { year, quarter: result.data };
}
