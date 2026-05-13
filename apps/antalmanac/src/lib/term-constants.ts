import { z } from 'zod';

/**
 * The 6 valid WebSOC quarter tokens used in AntAlmanac term short names.
 *
 * Split into 3 regular quarters and 3 summer sessions:
 *   - Regular: Fall, Winter, Spring
 *   - Summer:  Summer1 (5-wk session I), Summer2 (5-wk session II), Summer10wk (10-wk session)
 *
 * This is the single authoritative source for all term-related handling across the codebase.
 * Every place that parses, constructs, or validates a term short name must derive from here.
 *
 * @see {@link https://www.reg.uci.edu/calendars/quarterly} UCI Academic Calendar
 */

/** The 3 regular (non-summer) quarter tokens. */
export const REGULAR_QUARTERS = ['Fall', 'Winter', 'Spring'] as const;

/** The 3 summer session tokens. */
export const SUMMER_QUARTERS = ['Summer1', 'Summer2', 'Summer10wk'] as const;

/**
 * All 6 valid quarter tokens — 3 regular + 3 summer.
 * This is the canonical constant from which all term types and schemas are derived.
 */
export const QUARTERS = [...REGULAR_QUARTERS, ...SUMMER_QUARTERS] as const;

/** A valid WebSOC quarter token. */
export type Quarter = (typeof QUARTERS)[number];

/** Zod schema that parses/validates a raw string as a known {@link Quarter}. */
export const QuarterSchema = z.enum(QUARTERS);

/**
 * Human-readable display names for each quarter token.
 *
 * @example
 * QUARTER_LONG_NAMES['Fall']       // "Fall Quarter"
 * QUARTER_LONG_NAMES['Summer1']    // "Summer Session 1"
 * QUARTER_LONG_NAMES['Summer10wk'] // "10-wk Summer"
 */
export const QUARTER_LONG_NAMES = {
    Fall: 'Fall Quarter',
    Winter: 'Winter Quarter',
    Spring: 'Spring Quarter',
    Summer1: 'Summer Session 1',
    Summer2: 'Summer Session 2',
    Summer10wk: '10-wk Summer',
} as const satisfies Record<Quarter, string>;

/** Returns `true` if the quarter is one of the three summer sessions. */
export function isSummerQuarter(quarter: Quarter): boolean {
    return (SUMMER_QUARTERS as readonly string[]).includes(quarter);
}

/**
 * Build a valid AntAlmanac term short name from a year and quarter.
 *
 * @example
 * buildTermShortName('2024', 'Fall')    // "2024 Fall"
 * buildTermShortName(2025, 'Summer1')   // "2025 Summer1"
 */
export function buildTermShortName(year: string | number, quarter: Quarter): string {
    return `${year} ${quarter}`;
}

/**
 * Parse an AntAlmanac term short name (e.g. `"2024 Fall"`) into its constituent
 * year string and {@link Quarter} token.
 *
 * Returns `null` when the input does not contain a space or the quarter segment
 * is not one of the 6 known values — use the return value as a type-guard rather
 * than relying on exceptions.
 *
 * @example
 * parseTermShortName('2024 Fall')       // { year: '2024', quarter: 'Fall' }
 * parseTermShortName('2025 Summer10wk') // { year: '2025', quarter: 'Summer10wk' }
 * parseTermShortName('bad input')       // null
 * parseTermShortName('2024 Foo')        // null
 */
export function parseTermShortName(term: string): { year: string; quarter: Quarter } | null {
    const spaceIdx = term.indexOf(' ');
    if (spaceIdx === -1) return null;
    const year = term.slice(0, spaceIdx);
    const rawQuarter = term.slice(spaceIdx + 1);
    const result = QuarterSchema.safeParse(rawQuarter);
    if (!result.success) return null;
    return { year, quarter: result.data };
}
