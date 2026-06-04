import { getColorForNewSection } from '$stores/scheduleHelpers';
import { blue, green } from '@mui/material/colors';
import type { AATerm, ScheduleCourse } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const TERM: AATerm = {
    year: '2024',
    quarter: 'Fall',
    shortName: '2024 Fall',
    longName: 'Fall 2024',
    instructionStart: new Date(2024, 8, 1),
    instructionEnd: new Date(2024, 11, 1),
    finalsStart: new Date(2024, 11, 2),
    finalsEnd: new Date(2024, 11, 8),
    socAvailable: new Date(2024, 7, 1),
    isSummerTerm: false,
};

function scheduleCourse(
    courseId: string,
    sectionCode: string,
    sectionType: 'Lec' | 'Dis',
    color: string
): ScheduleCourse {
    return {
        courseId,
        deptCode: 'ICS',
        courseNumber: '31',
        courseTitle: 'Intro',
        courseComment: '',
        prerequisiteLink: '',
        sectionTypes: [sectionType],
        term: TERM,
        section: {
            sectionCode,
            sectionType,
            sectionNum: '1',
            units: '4',
            instructors: [],
            meetings: [],
            color,
        },
    };
}

describe('getColorForNewSection', () => {
    test('first section for a course picks an unused default color', () => {
        const existing = scheduleCourse('ICS31', '00100', 'Lec', blue[300]);
        const added = scheduleCourse('ICS32', '00100', 'Lec', '');

        const color = getColorForNewSection(added, [existing]);

        expect(color).not.toBe(blue[300]);
        expect(color).toBeTruthy();
    });

    test('same courseId and sectionCode reuses the existing section color', () => {
        const existing = scheduleCourse('ICS31', '00100', 'Lec', blue[300]);
        const added = scheduleCourse('ICS31', '00100', 'Lec', '');

        expect(getColorForNewSection(added, [existing])).toBe(blue[300]);
    });

    test('same courseId and sectionType but different sectionCode gets a distinct color', () => {
        const first = scheduleCourse('ICS31', '00100', 'Lec', blue[300]);
        const second = scheduleCourse('ICS31', '00200', 'Lec', '');

        const secondColor = getColorForNewSection(second, [first]);

        expect(secondColor).not.toBe(blue[300]);
    });

    test('same courseId with different section types gets a distinct color', () => {
        const lecture = scheduleCourse('ICS31', '00100', 'Lec', blue[300]);
        const discussion = scheduleCourse('ICS31', '00300', 'Dis', '');

        const discussionColor = getColorForNewSection(discussion, [lecture]);

        expect(discussionColor).not.toBe(blue[300]);
    });

    test('different courseIds do not inherit each others colors', () => {
        const other = scheduleCourse('ICS32', '00100', 'Lec', green[300]);
        const added = scheduleCourse('ICS31', '00100', 'Lec', '');

        expect(getColorForNewSection(added, [other])).not.toBe(green[300]);
    });
});
