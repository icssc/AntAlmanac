import { QuarterSchema, type AATerm } from '@packages/antalmanac-types';
import type { Quarter, Year } from '@packages/anteater-api/types';
import { addWeeks, differenceInWeeks, setDay } from 'date-fns';
import { z } from 'zod';

export const termSchema = z
    .object({
        year: z.string(),
        quarter: QuarterSchema,
        // TODO(zod-v4): Replace refine with z.literal.template() once we upgrade to Zod v4.
        shortName: z.string().refine((s): s is AATerm['shortName'] => parseTermShortName(s) !== undefined, {
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

/**
 * Parse an ISO "YYYY-MM-DD" string into a local-timezone Date,
 * avoiding UTC-vs-local shifts from `new Date(isoString)`.
 */
function parseLocalDate(dateStr: string): Date {
    const [y, month, day] = dateStr.split('-').map(Number);
    return new Date(y, month - 1, day);
}

export function parseQuarter(rawQuarter: unknown) {
    const quarter = QuarterSchema.safeParse(rawQuarter);
    return quarter.success ? quarter.data : undefined;
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

    const dropDeadline = setDay(addWeeks(term.instructionStart, weeksUntilDropDeadline), 5);
    dropDeadline.setHours(17, 0, 0, 0);
    return new Date() <= dropDeadline;
}
