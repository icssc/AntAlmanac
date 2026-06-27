import { getColorForNewSection, scheduleOfferingKey, scheduleSectionKey } from '$stores/scheduleHelpers';
import { blue } from '@mui/material/colors';
import type { AACourseWithTerm, AASection, AATerm } from '@packages/antalmanac-types';
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

function makeSection({
    sectionCode,
    sectionType,
    color,
}: {
    sectionCode: string;
    sectionType: 'Lec' | 'Dis';
    color: string;
}): AASection {
    return {
        sectionCode,
        sectionType,
        sectionNum: '1',
        units: '4',
        instructors: [],
        meetings: [],
        finalExam: { examStatus: 'NO_FINAL' },
        maxCapacity: '0',
        numCurrentlyEnrolled: { totalEnrolled: '0', sectionEnrolled: '0' },
        numOnWaitlist: '0',
        numWaitlistCap: '0',
        numRequested: '0',
        numNewOnlyReserved: '0',
        restrictions: '',
        status: 'OPEN',
        sectionComment: '',
        isCancelled: false,
        updatedAt: null,
        webURL: '',
        color,
    };
}

function makeCourse({
    term,
    courseId,
    courseTitle = 'Intro',
    sections,
}: {
    term: AATerm;
    courseId: string;
    courseTitle?: string;
    sections: AASection[];
}): AACourseWithTerm {
    return {
        courseId,
        deptCode: 'ICS',
        courseNumber: '31',
        courseTitle,
        courseComment: '',
        prerequisiteLink: '',
        sectionTypes: [sections[0]?.sectionType ?? 'Lec'],
        term,
        sections,
        updatedAt: null,
    };
}

describe('scheduleSectionKey', () => {
    test('formats term and section code', () => {
        expect(scheduleSectionKey(FALL_2024, '00100')).toBe('2024 Fall::00100');
    });

    test('differs across terms for the same section code', () => {
        expect(scheduleSectionKey(FALL_2024, '00100')).not.toBe(scheduleSectionKey(WINTER_2025, '00100'));
    });
});

describe('scheduleOfferingKey', () => {
    test('formats term, courseId, and title', () => {
        const section = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: blue[300] });
        const course = makeCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Intro',
            sections: [section],
        });

        expect(scheduleOfferingKey(course)).toBe('2024 Fall::ICS31::Intro');
    });

    test('differs across terms for the same courseId and title', () => {
        const section = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: blue[300] });
        const fall = makeCourse({ term: FALL_2024, courseId: 'ICS31', sections: [section] });
        const winter = makeCourse({ term: WINTER_2025, courseId: 'ICS31', sections: [section] });

        expect(scheduleOfferingKey(fall)).not.toBe(scheduleOfferingKey(winter));
    });

    test('differs across titles for the same courseId and term', () => {
        const section1 = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: blue[300] });
        const section2 = makeSection({ sectionCode: '00200', sectionType: 'Lec', color: blue[300] });
        const intro = makeCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Intro',
            sections: [section1],
        });
        const honors = makeCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Honors Intro',
            sections: [section2],
        });

        expect(scheduleOfferingKey(intro)).not.toBe(scheduleOfferingKey(honors));
    });
});

describe('getColorForNewSection', () => {
    test('same offering and section type reuse the existing color', () => {
        const firstLec = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: blue[300] });
        const existingCourse = makeCourse({ term: FALL_2024, courseId: 'ICS31', sections: [firstLec] });

        const secondLec = makeSection({ sectionCode: '00200', sectionType: 'Lec', color: '' });
        const newCourse = makeCourse({ term: FALL_2024, courseId: 'ICS31', sections: [secondLec] });

        expect(getColorForNewSection(secondLec, newCourse, [existingCourse])).toBe(blue[300]);
    });

    test('same offering with a different section type gets a near color variant', () => {
        const lecture = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: blue[300] });
        const existingCourse = makeCourse({ term: FALL_2024, courseId: 'ICS31', sections: [lecture] });

        const discussion = makeSection({ sectionCode: '00300', sectionType: 'Dis', color: '' });
        const newCourse = makeCourse({ term: FALL_2024, courseId: 'ICS31', sections: [discussion] });

        const discussionColor = getColorForNewSection(discussion, newCourse, [existingCourse]);

        expect(discussionColor).not.toBe(blue[300]);
        expect(discussionColor).toBe(blue[200]);
    });

    test('different term is a separate offering with its own default color', () => {
        const fallLec = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: blue[300] });
        const fallCourse = makeCourse({ term: FALL_2024, courseId: 'ICS31', sections: [fallLec] });

        const winterLec = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: '' });
        const winterCourse = makeCourse({ term: WINTER_2025, courseId: 'ICS31', sections: [winterLec] });

        expect(getColorForNewSection(winterLec, winterCourse, [fallCourse])).not.toBe(blue[300]);
    });

    test('different title in the same term is a separate offering', () => {
        const introSec = makeSection({ sectionCode: '00100', sectionType: 'Lec', color: blue[300] });
        const intro = makeCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Intro',
            sections: [introSec],
        });

        const honorsSec = makeSection({ sectionCode: '00200', sectionType: 'Lec', color: '' });
        const honors = makeCourse({
            term: FALL_2024,
            courseId: 'ICS31',
            courseTitle: 'Honors Intro',
            sections: [honorsSec],
        });

        expect(getColorForNewSection(honorsSec, honors, [intro])).not.toBe(blue[300]);
    });
});
