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
function getDefaultTerm(events: (CustomEvent | CourseEvent)[] = []): Term | undefined {
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
    if (defaultTerm >= 0) {
        return new Date(termData[defaultTerm]!.finalsStartDate);
    }
    return new Date();
}

function getFinalsStartDateForTerm(term: string) {
    const termThatMatches = termData.find((t) => t.shortName === term);
    if (termThatMatches === undefined) {
        console.warn(`No matching term for ${term}`);
        return getDefaultFinalsStartDate();
    }

    return new Date(termThatMatches.finalsStartDate);
}

export { defaultTerm, getDefaultTerm, termData, getDefaultFinalsStartDate, getFinalsStartDateForTerm };
