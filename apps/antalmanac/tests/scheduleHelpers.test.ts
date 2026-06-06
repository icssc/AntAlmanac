import { getColorForNewSection, groupCourseSections, scheduleOfferingKey } from '$stores/scheduleHelpers';
import { blue } from '@mui/material/colors';
import type { AATerm, ScheduleCourse } from '@packages/antalmanac-types';
import { describe, expect, test } from 'vitest';

const FALL_2024: AATerm = {
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

const WINTER_2025: AATerm = {
    year: '2025',
    quarter: 'Winter',
    shortName: '2025 Winter',
    longName: 'Winter 2025',
    instructionStart: new Date(2025, 0, 1),
    instructionEnd: new Date(2025, 2, 1),
    finalsStart: new Date(2025, 2, 2),
    finalsEnd: new Date(2025, 2, 8),
    socAvailable: new Date(2024, 10, 1),
    isSummerTerm: false,
};

function scheduleCourse({
    term,
    courseId,
    courseTitle = 'Intro',
    sectionCode,
    sectionType,
    color,
}: {
    term: AATerm;
    courseId: string;
    courseTitle?: string;
    sectionCode: string;
    sectionType: 'Lec' | 'Dis';
    color: string;
}): ScheduleCourse {
    return {
        courseId,
        deptCode: 'ICS',
        courseNumber: '31',
        courseTitle,
        courseComment: '',
        prerequisiteLink: '',
        sectionTypes: [sectionType],
        term,
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

describe('scheduleOfferingKey', () => {
    test('formats term, courseId, and title', () => {
        const course = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Intro',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });

        expect(scheduleOfferingKey(course)).toBe('2024 Fall::ICS31::Intro');
    });

    test('differs across terms for the same courseId and title', () => {
        const fall = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const winter = scheduleCourse({
            term: WINTER_2025,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });

        expect(scheduleOfferingKey(fall)).not.toBe(scheduleOfferingKey(winter));
    });

    test('differs across titles for the same courseId and term', () => {
        const intro = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Intro',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const honors = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Honors Intro',
            sectionCode: '00200',
            sectionType: 'Lec',
            color: blue[300],
        });

        expect(scheduleOfferingKey(intro)).not.toBe(scheduleOfferingKey(honors));
    });
});

describe('getColorForNewSection', () => {
    test('same offering and section type reuse the existing color', () => {
        const firstLec = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const secondLec = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00200',
            sectionType: 'Lec',
            color: '',
        });

        expect(getColorForNewSection(secondLec, [firstLec])).toBe(blue[300]);
    });

    test('same offering with a different section type gets a near color variant', () => {
        const lecture = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const discussion = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00300',
            sectionType: 'Dis',
            color: '',
        });

        const discussionColor = getColorForNewSection(discussion, [lecture]);

        expect(discussionColor).not.toBe(blue[300]);
        expect(discussionColor).toBe(blue[200]);
    });

    test('different term is a separate offering with its own default color', () => {
        const fallLec = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const winterLec = scheduleCourse({
            term: WINTER_2025,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: '',
        });

        expect(getColorForNewSection(winterLec, [fallLec])).not.toBe(blue[300]);
    });

    test('different title in the same term is a separate offering', () => {
        const intro = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Intro',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const honors = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Honors Intro',
            sectionCode: '00200',
            sectionType: 'Lec',
            color: '',
        });

        expect(getColorForNewSection(honors, [intro])).not.toBe(blue[300]);
    });
});

describe('groupCourseSections', () => {
    test('groups sections under the same offering together', () => {
        const lec = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const dis = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00300',
            sectionType: 'Dis',
            color: blue[200],
        });
        const other = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS32',
            sectionCode: '00400',
            sectionType: 'Lec',
            color: blue[100],
        });

        const grouped = groupCourseSections([other, dis, lec]);
        const codes = grouped.map((c) => c.section.sectionCode);

        expect(codes).toContain('00100');
        expect(codes).toContain('00300');
        expect(codes).toContain('00400');
        expect(Math.abs(codes.indexOf('00100') - codes.indexOf('00300'))).toBe(1);
    });

    test('does not group the same courseId across terms', () => {
        const fall = scheduleCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            sectionCode: '00100',
            sectionType: 'Lec',
            color: blue[300],
        });
        const winter = scheduleCourse({
            term: WINTER_2025,
            courseId: 'ICS31',
            sectionCode: '00200',
            sectionType: 'Lec',
            color: blue[200],
        });

        const grouped = groupCourseSections([winter, fall]);

        expect(grouped.map((c) => c.term.shortName)).toEqual(['2025 Winter', '2024 Fall']);
    });
});
