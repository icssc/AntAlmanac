import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import termJson from '$generated/termData.json';
import type { AATerm } from '@packages/antalmanac-types';
import type { Quarter } from '@packages/anteater-api/types';
import { addWeeks, differenceInWeeks, setDay } from 'date-fns';
import { z } from 'zod';

export type { AATerm } from '@packages/antalmanac-types';

const QUARTERS = ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2'] as const satisfies readonly Quarter[];

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
        quarter: z.enum(QUARTERS),
        shortName: z.string().refine(
            (s): s is `${string} ${(typeof QUARTERS)[number]}` => {
                const parts = s.split(' ');
                return parts.length === 2 && (QUARTERS as readonly string[]).includes(parts[1]);
            },
            { message: 'shortName must be "<year> <quarter>"' }
        ),
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
        if (!event.isCustomEvent && event.term) {
            const match = termData.find((t) => t.shortName === event.term);
            if (match) return match;
        }
    }
    return termData[defaultTermIndex];
}

export function getTermByShortName(termShortName: string): AATerm | undefined {
    return termData.find((t) => t.shortName === termShortName);
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
