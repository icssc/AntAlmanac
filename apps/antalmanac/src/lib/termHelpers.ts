import { QuarterSchema } from '@packages/antalmanac-types';
import type { Quarter, Year } from '@packages/anteater-api/types';

export function parseTermShortName(shortName: string): { year: Year; quarter: Quarter } | undefined {
    const parts = shortName.split(' ');
    if (parts.length !== 2) {
        return undefined;
    }

    const [year, rawQuarter] = parts;
    const result = QuarterSchema.safeParse(rawQuarter);
    if (!result.success) {
        return undefined;
    }

    return { year, quarter: result.data };
}
