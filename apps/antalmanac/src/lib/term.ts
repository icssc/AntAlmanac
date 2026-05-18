import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import termJson from '$generated/termData.json';
import { QuarterSchema, type AATerm } from '@packages/antalmanac-types';
import { Year } from '@packages/anteater-api/types';
import { addWeeks, differenceInWeeks, setDay } from 'date-fns';
import { z } from 'zod';

import { parseTermShortName } from './termHelpers';

export type { AATerm } from '@packages/antalmanac-types';

/**
 * Parse an ISO "YYYY-MM-DD" string into a local-timezone Date,
 * avoiding UTC-vs-local shifts from `new Date(isoString)`.
 */
function parseLocalDate(dateStr: string): Date {
    const [y, month, day] = dateStr.split('-').map(Number);
    return new Date(y, month - 1, day);
}

const termSchema = z
    .object({
        year: z.string(),
        quarter: QuarterSchema,
        // TODO(zod-v4): Replace refine with z.literal.template() once we upgrade to Zod v4.
        shortName: z
            .string()
            .refine((s): s is AATerm['shortName'] => parseTermShortName(s) !== undefined, {
                message: 'shortName must be "<year> <quarter>"',
            }),
        longName: z.string(),
        instructionStart: z.string().date(),
        instructionEnd: z.string().date(),
        finalsStart: z.string().date(),
        finalsEnd: z.string().date(),
        socAvailable: z.string().date(),
        isSummerTerm: z.boolean(),
    })
    .transform(
        (t): AATerm => ({
            year: t.year,
            quarter: t.quarter,
            shortName: t.shortName,
            longName: t.longName,
            instructionStart: parseLocalDate(t.instructionStart),
            instructionEnd: parseLocalDate(t.instructionEnd),
            finalsStart: parseLocalDate(t.finalsStart),
            finalsEnd: parseLocalDate(t.finalsEnd),
            socAvailable: parseLocalDate(t.socAvailable),
            isSummerTerm: t.isSummerTerm,
        })
    );

const allTerms: AATerm[] = z.array(termSchema).parse(termJson);

export const termData = allTerms.filter((term) => term.socAvailable <= new Date());

const defaultTermIndex = termData.findIndex((term) => !term.isSummerTerm);

/**
 * Get the default term (first non-summer term with SOC available).
 *
 * If an array of events is provided, returns the first term found in those events instead.
 */
export function getDefaultTerm(events: (CustomEvent | CourseEvent)[] = []): AATerm {
    for (const event of events) {
        if (!event.isCustomEvent) {
            return event.term;
        }
    }
    return termData[defaultTermIndex];
}

export function getTermByShortName(termShortName: string): AATerm | undefined {
    return termData.find((t) => t.shortName === termShortName);
}

export function parseQuarter(rawQuarter: unknown) {
    const quarter = QuarterSchema.safeParse(rawQuarter);
    return quarter.success ? quarter.data : undefined;
}

export function getTermByYearAndQuarter(year: Year, rawQuarter: unknown): AATerm | undefined {
    const quarter = parseQuarter(rawQuarter);
    if (!quarter) {
        return undefined;
    }
    return termData.find((term) => term.year === year && term.quarter === quarter);
}

export function isTermAvailable(termShortName: string) {
    return termData.some((term) => term.shortName === termShortName);
}

/**
 * Enrollment can change until the drop deadline, i.e. when enrollment closes.
 * For full terms (10-week quarters), enrollment closes on the Friday of Week 2.
 * For short terms (5-week summer terms), enrollment closes on the Friday of Week 1.
 *
 * See {@link https://www.reg.uci.edu/enrollment/adc/adcpolicy.html} for full terms and
 * {@link https://summer.uci.edu/faq} for shorter summer terms.
 */
export function canTermEnrollmentChange(term: AATerm) {
    if (new Date().getFullYear() - term.instructionStart.getFullYear() > 1) {
        return false;
    }

    const isTermShort = differenceInWeeks(term.finalsStart, term.instructionStart) < 9;
    const hasWeekZero = term.instructionStart.getDay() !== 1;
    let weeksUntilDropDeadline = isTermShort ? 0 : 1;
    if (hasWeekZero) {
        weeksUntilDropDeadline++;
    }

    return new Date() <= setDay(addWeeks(term.instructionStart, weeksUntilDropDeadline), 5);
}
