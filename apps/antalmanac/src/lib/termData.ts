import moment from 'moment';

import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import { terms } from '$generated/termData';

/**
 * Quarterly Academic Calendar {@link https://www.reg.uci.edu/calendars/quarterly/2023-2024/quarterly23-24.html}
 * Quick Reference Ten Year Calendar {@link https://www.reg.uci.edu/calendars/academic/tenyr-19-29.html}
 * The `startDate`, if available, should correspond to the __instruction start date__ (not the quarter start date)
 * The `finalsStartDate`, if available, should correspond to the __final exams__ first date (should be a Saturday)
 */
export type Term = {
    shortName: `${string} ${string}`;
    longName: string;
    startDate: Date;
    finalsStartDate: Date;
    socAvailable: Date;
    isSummerTerm: boolean;
};

/**
 * Only include terms that have a SOC available.
 */
const termData = terms.filter((term) => {
    return term.socAvailable <= new Date();
});

// The index of the default term in termData, as per WebSOC
const defaultTerm = termData.findIndex((term) => !term.isSummerTerm);

/** Short names of terms whose courses' enrollment can change */
const openEnrollmentTerms = getOpenEnrollmentTerms();

/**
 * Get the default term.
 *
 * By default, use a static index.
 * If an array of events is provided, select the first term found.
 */
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
    return new Date(termData[defaultTerm].finalsStartDate);
}

function getFinalsStartDateForTerm(term: string) {
    const termThatMatches = termData.find((t) => t.shortName === term);
    if (termThatMatches === undefined) {
        console.warn(`No matching term for ${term}`);
        return getDefaultFinalsStartDate();
    }

    return new Date(termThatMatches.finalsStartDate);
}

export function canTermEnrollmentChange(termShortName: Term['shortName']) {
    return openEnrollmentTerms.has(termShortName);
}

function getOpenEnrollmentTerms() {
    const openEnrollmentTerms: Set<Term['shortName']> = new Set();

    for (const term of termData) {
        if (new Date().getFullYear() - term.startDate.getFullYear() > 1) {
            break;
        }
        if (isTermEnrollmentOpen(term)) {
            openEnrollmentTerms.add(term.shortName);
        }
    }

    return openEnrollmentTerms;
}

function isTermEnrollmentOpen(term: Term): boolean {
    const instructionStartDate = moment(term.startDate);
    const isTermShort = moment(term.finalsStartDate).diff(instructionStartDate, 'week') < 9;
    const hasWeekZero = term.startDate.getDay() !== 1;

    let weeksUntilDropDeadline = 1;
    if (isTermShort) {
        weeksUntilDropDeadline = 0;
    }
    if (hasWeekZero) {
        weeksUntilDropDeadline++;
    }

    return moment() <= instructionStartDate.add(weeksUntilDropDeadline, 'week').day(5);
}

export { defaultTerm, getDefaultTerm, termData, getDefaultFinalsStartDate, getFinalsStartDateForTerm };
