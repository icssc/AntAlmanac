import type { CourseEvent, CustomEvent } from '$components/Calendar/CourseCalendarEvent';
import termJson from '$generated/termData.json';
import { parseQuarter, termSchema } from '$lib/termHelpers';
import type { AATerm } from '@packages/antalmanac-types';
import { Year } from '@packages/anteater-api/types';
import { z } from 'zod';

export type { AATerm } from '@packages/antalmanac-types';

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
