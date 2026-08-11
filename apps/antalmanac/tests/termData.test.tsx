import type { CourseEvent, CustomEvent } from '$components/Calendar/types';
import { getDefaultTerm, termData } from '$lib/term';
import type { AATerm } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const FALL_2023: AATerm = {
    year: '2023',
    quarter: 'Fall',
    shortName: '2023 Fall',
    longName: '2023 Fall Quarter',
    instructionStart: new Date(2023, 8, 28),
    instructionEnd: new Date(2023, 11, 8),
    finalsStart: new Date(2023, 11, 9),
    finalsEnd: new Date(2023, 11, 15),
    socAvailable: new Date(2023, 4, 1),
    isSummerTerm: false,
};

const WINTER_2024: AATerm = {
    year: '2024',
    quarter: 'Winter',
    shortName: '2024 Winter',
    longName: '2024 Winter Quarter',
    instructionStart: new Date(2024, 0, 8),
    instructionEnd: new Date(2024, 2, 15),
    finalsStart: new Date(2024, 2, 16),
    finalsEnd: new Date(2024, 2, 22),
    socAvailable: new Date(2023, 9, 1),
    isSummerTerm: false,
};

function courseEvent(term: AATerm): CourseEvent {
    return {
        locations: [],
        showLocationInfo: false,
        finalExam: {
            examStatus: 'NO_FINAL',
        },
        courseTitle: '',
        instructors: [],
        eventKind: 'course',
        sectionCode: '',
        sectionType: '',
        term,
        color: '',
        deptValue: '',
        courseNumber: '',
        start: new Date(0),
        end: new Date(0),
        title: '',
    };
}

function customEvent(): CustomEvent {
    return {
        eventKind: 'custom',
        customEventID: '1',
        building: '',
        days: ['M'],
        color: '',
        start: new Date(0),
        end: new Date(0),
        title: '',
    };
}

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

    test('uses default term index if the events contain no courses', () => {
        const defaultTermIndex = termData.findIndex((t) => !t.isSummerTerm);

        expect(getDefaultTerm([customEvent()]).shortName).toEqual(termData[defaultTermIndex].shortName);
    });
});
