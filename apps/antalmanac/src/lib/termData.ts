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

/**
 * Get the latest term from a list of terms
 *
 * If no terms are provided, returns the default term.
 * If an array of terms is provided, returns the term with the latest start dates. For example,
 * if the events given have terms 2023 Winter, 2024 Spring and 2023 Summer, the function returns
 * the 2024 Spring term.
 */
function getLatestTerm(termNames: string[] = []): Term {
    const filteredTerms = termNames
        .map((term) => termData.find((existingTerm) => existingTerm.shortName === term))
        .filter((maybeTerm) => maybeTerm !== undefined);

    if (filteredTerms.length === 0) {
        return getDefaultTerm();
    }

    return filteredTerms.reduce((latestTerm, currTerm) => {
        if (!latestTerm || currTerm.startDate.getTime() > latestTerm.startDate.getTime()) {
            return currTerm;
        }
        return latestTerm;
    });
}

export { defaultTerm, getDefaultTerm, termData, getDefaultFinalsStartDate, getFinalsStartDateForTerm, getLatestTerm };
