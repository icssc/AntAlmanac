import { QuarterSchema } from '@packages/antalmanac-types';
import type { Quarter, Year } from '@packages/anteater-api/types';

export type TermParts = { year: Year; quarter: Quarter };

/**
 * Parse a `"<year> <quarter>"` shortName (e.g. `"2025 Fall"`) into its parts.
 * Returns `undefined` if the format or quarter value is invalid.
 *
 * Kept free of `termData.json` and `$`-alias imports so it can run under
 * tsx (e.g. in the `update-terms` script) without a path-alias resolver.
 */
export function parseTermShortName(shortName: string): TermParts | undefined {
    const parts = shortName.split(' ');
    if (parts.length !== 2) return undefined;
    const [year, rawQuarter] = parts;
    const result = QuarterSchema.safeParse(rawQuarter);
    if (!result.success) return undefined;
    return { year, quarter: result.data };
}
