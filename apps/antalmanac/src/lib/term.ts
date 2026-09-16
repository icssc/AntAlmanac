import { type CourseEvent, type CustomEvent, isCourseEvent } from '$components/Calendar/types';
import termJson from '$generated/termData.json';
import { parseQuarter, termSchema } from '$lib/termHelpers';
import type { AATerm } from '@packages/antalmanac-types';
import { type Year } from '@packages/anteater-api/types';
import { z } from 'zod';

const allTerms: AATerm[] = z.array(termSchema).parse(termJson);

export const termData = allTerms.filter((term) => term.socAvailable <= new Date());

const defaultTermIndex = termData.findIndex((term) => !term.isSummerTerm);

/**
 * Get the default term (first non-summer term with SOC available).
 *
 * If an array of events is provided, returns the latest term among its course events instead.
 * A schedule can hold courses from more than one term, and the events are in whatever order
 * they were added, so the latest term is used rather than whichever one happens to come first.
 */
export function getDefaultTerm(events: (CustomEvent | CourseEvent)[] = []): AATerm {
    let latestTerm: AATerm | undefined;

    for (const event of events) {
        if (!isCourseEvent(event)) {
            continue;
        }

        if (latestTerm === undefined || event.term.instructionStart > latestTerm.instructionStart) {
            latestTerm = event.term;
        }
    }

    return latestTerm ?? termData[defaultTermIndex];
}

export function getTermByShortName(termShortName: string): AATerm | undefined {
    return termData.find((t) => t.shortName === termShortName);
}

export function getTermByYearAndQuarter(year: Year, rawQuarter: unknown): AATerm | undefined {
    const quarter = parseQuarter(rawQuarter);
    if (!quarter) {
        return undefined;
    }
    return termData.find((term) => term.year === year && term.quarter === quarter);
}
