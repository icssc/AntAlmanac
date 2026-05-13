import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import termJson from '$generated/termData.json';
import { isSummerQuarter, QUARTER_LONG_NAMES, QuarterSchema, type Quarter } from '$lib/term-constants';
import { addWeeks, differenceInWeeks, setDay } from 'date-fns';
import { z } from 'zod';

export type { Quarter } from '$lib/term-constants';
export {
    buildTermShortName,
    isSummerQuarter,
    parseTermShortName,
    QUARTER_LONG_NAMES,
    QUARTERS,
    QuarterSchema,
    REGULAR_QUARTERS,
    SUMMER_QUARTERS,
} from '$lib/term-constants';

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

const termData = terms.filter((term) => term.socAvailable <= new Date());

const defaultTerm = termData.findIndex((term) => !term.isSummerTerm);

const openEnrollmentTerms = getOpenEnrollmentTerms();

function getDefaultTerm(events: (CustomEvent | CourseEvent)[] = []): Term {
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

function getDefaultFinalsStartDate() {
    return new Date(termData[defaultTerm].finalsStart);
}

function getFinalsStartDateForTerm(term: string) {
    const termThatMatches = termData.find((t) => t.shortName === term);
    if (termThatMatches === undefined) {
        console.warn(`No matching term for ${term}`);
        return getDefaultFinalsStartDate();
    }

    return new Date(termThatMatches.finalsStart);
}

function getCurrentTerm(): { year: number; quarter: string } {
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

export { defaultTerm, getDefaultTerm, termData, getDefaultFinalsStartDate, getFinalsStartDateForTerm, getCurrentTerm };
