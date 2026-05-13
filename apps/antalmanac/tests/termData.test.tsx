import type { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { getDefaultTerm, defaultTerm, termData } from '$lib/termData';
import { describe, test, expect } from 'vitest';

describe('termData', () => {
    test('uses default term if no events are provided', () => {
        const term = getDefaultTerm();
        expect(term.shortName).toEqual(termData[defaultTerm].shortName);
    });

    test('falls back to default term when event term is empty', () => {
        const event: CourseEvent = {
            locations: [],
            showLocationInfo: false,
            finalExam: {
                examStatus: 'NO_FINAL',
            },
            courseTitle: '',
            instructors: [],
            isCustomEvent: false,
            sectionCode: '',
            sectionType: '',
            term: '',
            color: '',
            deptValue: '',
            courseNumber: '',
            start: new Date(0),
            end: new Date(0),
            title: '',
        };

        // event.term is empty (falsy), so getDefaultTerm should still return the default term.
        const term = getDefaultTerm([event]);
        expect(term.shortName).toEqual(termData[defaultTerm].shortName);
    });

    test('uses first matching term found in event list', () => {
        const targetTerm = termData[defaultTerm];
        const event: CourseEvent = {
            locations: [],
            showLocationInfo: false,
            finalExam: {
                examStatus: 'NO_FINAL',
            },
            courseTitle: '',
            instructors: [],
            isCustomEvent: false,
            sectionCode: '',
            sectionType: '',
            term: targetTerm.shortName,
            color: '',
            deptValue: '',
            courseNumber: '',
            start: new Date(0),
            end: new Date(0),
            title: '',
        };

        const term = getDefaultTerm([event]);
        expect(term.shortName).toEqual(targetTerm.shortName);
    });
});
