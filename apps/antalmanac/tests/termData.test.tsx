import { getDefaultTerm, termData } from '$lib/term';
import { describe, expect, test } from 'vitest';

import { FALL_2023, WINTER_2024, courseEvent, customEvent } from './helpers/term-fixtures';

describe('termData', () => {
    /**
     * Leaky/abstracted test because it knows how the function actually works.
     */
    test('uses default term index if no events is provided', () => {
        const defaultTermIndex = termData.findIndex((t) => !t.isSummerTerm);
        const term = getDefaultTerm();
        expect(term.shortName).toEqual(termData[defaultTermIndex].shortName);
    });

    test('uses the term found in event list if provided', () => {
        const event = courseEvent(getDefaultTerm());

        expect(getDefaultTerm([event]).shortName).toEqual(event.term.shortName);
    });

    test('uses the latest term when the events span multiple terms', () => {
        const events = [courseEvent(FALL_2023), courseEvent(WINTER_2024)];

        expect(getDefaultTerm(events).shortName).toEqual(WINTER_2024.shortName);
    });

    test('uses the latest term regardless of the order of the events', () => {
        const events = [courseEvent(WINTER_2024), courseEvent(FALL_2023)];

        expect(getDefaultTerm(events).shortName).toEqual(WINTER_2024.shortName);
    });

    test('falls back to the no-events default term when the events contain no courses', () => {
        expect(getDefaultTerm([customEvent()]).shortName).toEqual(getDefaultTerm().shortName);
    });
});
