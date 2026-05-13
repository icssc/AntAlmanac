import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import termJson from '$generated/termData.json';
import { addWeeks, differenceInWeeks, setDay } from 'date-fns';
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

/**
 * Parses a term short name (e.g. `"2024 Fall"`) into `{ year, quarter }`.
 * Returns `null` for unrecognised quarter tokens instead of throwing.
 */
export function parseTermShortName(term: string): { year: string; quarter: Quarter } | null {
    const spaceIdx = term.indexOf(' ');
    if (spaceIdx === -1) return null;
    const result = QuarterSchema.safeParse(term.slice(spaceIdx + 1));
    if (!result.success) return null;
    return { year: term.slice(0, spaceIdx), quarter: result.data };
}

/**
 * Quarterly Academic Calendar {@link https://www.reg.uci.edu/calendars/quarterly/2023-2024/quarterly23-24.html}
 * Quick Reference Ten Year Calendar {@link https://www.reg.uci.edu/calendars/academic/tenyr-19-29.html}
 */
export type Term = {
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

function parseLocalDate(dateStr: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number);
    return new Date(year, month - 1, day);
}

const termSchema = z
    .object({
        year: z.string(),
        quarter: QuarterSchema,
        instructionStart: z.string().date(),
        instructionEnd: z.string().date(),
        finalsStart: z.string().date(),
        finalsEnd: z.string().date(),
        socAvailable: z.string().date(),
    })
    .transform(
        ({ year, quarter, instructionStart, instructionEnd, finalsStart, finalsEnd, socAvailable }): Term => ({
            year,
            quarter,
            shortName: `${year} ${quarter}`,
            longName: `${year} ${QUARTER_LONG_NAMES[quarter]}`,
            instructionStart: parseLocalDate(instructionStart),
            instructionEnd: parseLocalDate(instructionEnd),
            finalsStart: parseLocalDate(finalsStart),
            finalsEnd: parseLocalDate(finalsEnd),
            socAvailable: parseLocalDate(socAvailable),
            isSummerTerm: isSummerQuarter(quarter),
        })
    );

const terms: Term[] = z.array(termSchema).parse(termJson);

export const termData = terms.filter((term) => term.socAvailable <= new Date());

export const defaultTerm = termData.findIndex((term) => !term.isSummerTerm);

const openEnrollmentTerms = getOpenEnrollmentTerms();

export function getDefaultTerm(events: (CustomEvent | CourseEvent)[] = []): Term {
    let term = termData[defaultTerm];

    for (const event of events) {
        if (!event.isCustomEvent && event.term) {
            const existingTerm = termData.find((t) => t.shortName === event.term);
            if (existingTerm) {
                term = existingTerm;
                break;
            }
        }
    }

    return term;
}

export function getDefaultFinalsStartDate() {
    return new Date(termData[defaultTerm].finalsStart);
}

export function getFinalsStartDateForTerm(term: string) {
    const termThatMatches = termData.find((t) => t.shortName === term);
    if (termThatMatches === undefined) {
        console.warn(`No matching term for ${term}`);
        return getDefaultFinalsStartDate();
    }

    return new Date(termThatMatches.finalsStart);
}

export function getCurrentTerm(): { year: number; quarter: string } {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const quarter = month <= 3 ? 'Winter' : month <= 6 ? 'Spring' : month <= 9 ? 'Summer' : 'Fall';
    return { year, quarter };
}

export function getTermLongName(termShortName: string) {
    return termData.find((term) => term.shortName === termShortName)?.longName ?? '';
}

/**
 * Enrollment can change until the drop deadline, i.e. when enrollment closes.
 * For full terms (10-week quarters), enrollment closes on the Friday of Week 2.
 * For short terms (5-week summer terms), enrollment closes on the Friday of Week 1.
 *
 * See {@link https://www.reg.uci.edu/enrollment/adc/adcpolicy.html} for full terms and
 * {@link https://summer.uci.edu/faq} for shorter summer terms.
 *
 * @returns `true` if enrollment is open for the given term, `false` if not.
 */
export function canTermEnrollmentChange(termShortName: Term['shortName']) {
    return openEnrollmentTerms.has(termShortName);
}

function getOpenEnrollmentTerms() {
    const openEnrollmentTerms: Set<Term['shortName']> = new Set();

    for (const term of termData) {
        if (new Date().getFullYear() - term.instructionStart.getFullYear() > 1) {
            break;
        }
        if (isTermEnrollmentOpen(term)) {
            openEnrollmentTerms.add(term.shortName);
        }
    }

    return openEnrollmentTerms;
}

/**
 * See {@link canTermEnrollmentChange} docs.
 */
function isTermEnrollmentOpen(term: Term): boolean {
    const isTermShort = differenceInWeeks(term.finalsStart, term.instructionStart) < 9;
    const hasWeekZero = term.instructionStart.getDay() !== 1;

    let weeksUntilDropDeadline = 1;
    if (isTermShort) {
        weeksUntilDropDeadline = 0;
    }
    if (hasWeekZero) {
        weeksUntilDropDeadline++;
    }

    const dropDeadline = setDay(addWeeks(term.instructionStart, weeksUntilDropDeadline), 5);
    return new Date() <= dropDeadline;
}

export function isTermAvailable(termShortName: string) {
    return termData.find((term) => term.shortName === termShortName) !== undefined;
}
