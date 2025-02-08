import { describe, test, expect } from 'vitest';

import { CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { getDefaultTerm } from '$lib/termData';

describe('termData', () => {
    test('uses first term found in event list if provided', () => {
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
            start: new Date(0),
            end: new Date(0),
            title: '',
        };

        const term = getDefaultTerm([event]);

        expect(term.shortName).toEqual(event.term);
    });
});
