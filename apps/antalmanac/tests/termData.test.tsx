import type { CourseEvent } from '$components/Calendar/types';
import { getDefaultTerm, termData } from '$lib/term';
import { describe, expect, test } from 'vitest';

describe('termData', () => {
    /**
     * Leaky/abstracted test because it knows how the function actually works.
     */
    test('uses default term index if no events is provided', () => {
        const defaultTermIndex = termData.findIndex((t) => !t.isSummerTerm);
        const term = getDefaultTerm();
        expect(term.shortName).toEqual(termData[defaultTermIndex].shortName);
    });

    test('uses first term found in event list if provided', () => {
        const term = getDefaultTerm();
        const event: CourseEvent = {
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

        expect(getDefaultTerm([event]).shortName).toEqual(event.term.shortName);
    });

    test('uses the latest term when events span multiple terms', () => {
        const [newer, older] = [...termData].sort(
            (a, b) => b.instructionStart.getTime() - a.instructionStart.getTime()
        );
        const makeEvent = (term: CourseEvent['term']): CourseEvent => ({
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
        });

        expect(getDefaultTerm([makeEvent(older), makeEvent(newer)]).shortName).toEqual(newer.shortName);
        expect(getDefaultTerm([makeEvent(newer), makeEvent(older)]).shortName).toEqual(newer.shortName);
    });
});
