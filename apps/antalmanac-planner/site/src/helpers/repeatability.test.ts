import type { PlannerYearData } from '../types/types';
import { LOADING_COURSE_PLACEHOLDER } from './courseRequirements';
import { calculateTotalUnits } from './planner';
import {
    buildCourseEnrollments,
    completedCoursesFromCredits,
    CourseEnrollment,
    evaluateRepeatability,
    totalEnrollmentCredit,
} from './repeatability';

function enrollment(id: string, changes: Partial<CourseEnrollment> = {}): CourseEnrollment {
    return {
        id,
        source: 'roadmap',
        courseId: 'COMPSCI199',
        units: 4,
        repeatabilityTimes: 0,
        repeatabilityType: 'times',
        ...changes,
    };
}

const course = {
    ...LOADING_COURSE_PLACEHOLDER,
    id: 'COMPSCI199',
    minUnits: 4,
    repeatabilityTimes: 0,
    repeatabilityType: 'times' as const,
};
function years(): PlannerYearData[] {
    return [
        {
            startYear: 2026,
            name: 'Year',
            collapsed: false,
            quarters: [
                { name: 'Fall', courses: [course] },
                { name: 'Winter', courses: [course] },
            ],
        },
    ];
}

describe('repeatability limits', () => {
    it('allows one enrollment for a non-repeatable course', () => {
        const result = evaluateRepeatability([enrollment('fall'), enrollment('winter')]);
        expect(result.map((credit) => [credit.eligible, credit.creditedUnits, credit.overLimit])).toEqual([
            [true, 4, false],
            [false, 0, true],
        ]);
    });

    it.each([1, 2, 3])('includes the first take within a total limit of %i', (limit) => {
        const result = evaluateRepeatability(
            Array.from({ length: limit + 1 }, (_, i) => enrollment(String(i), { repeatabilityTimes: limit }))
        );
        expect(result.filter((credit) => credit.eligible)).toHaveLength(limit);
        expect(result[limit].overLimit).toBe(true);
    });

    it('caps unit-based repeats at the remaining allowance, including partial credit', () => {
        const result = evaluateRepeatability(
            ['a', 'b', 'c'].map((id) => enrollment(id, { repeatabilityTimes: 6, repeatabilityType: 'credit_hours' }))
        );
        expect(result.map((credit) => credit.creditedUnits)).toEqual([4, 2, 0]);
        expect(result.map((credit) => credit.eligible)).toEqual([true, true, false]);
        expect(result.map((credit) => credit.overLimit)).toEqual([false, true, true]);
        expect(totalEnrollmentCredit(result)).toEqual({ unitCount: 6, courseCount: 2 });
    });

    it('does not warn at the exact unit boundary', () => {
        const result = evaluateRepeatability(
            ['a', 'b'].map((id) => enrollment(id, { repeatabilityTimes: 8, repeatabilityType: 'credit_hours' }))
        );
        expect(result.every((credit) => credit.eligible && !credit.overLimit)).toBe(true);
    });

    it('supports unlimited repetitions', () => {
        const result = evaluateRepeatability(
            ['a', 'b', 'c'].map((id) => enrollment(id, { repeatabilityTimes: null, repeatabilityType: null }))
        );
        expect(result.every((credit) => credit.eligible && !credit.overLimit)).toBe(true);
        expect(totalEnrollmentCredit(result).unitCount).toBe(12);
    });

    it('conservatively permits one take when repeatability metadata is absent', () => {
        const result = evaluateRepeatability(
            ['a', 'b'].map((id) => enrollment(id, { repeatabilityTimes: undefined, repeatabilityType: undefined }))
        );
        expect(result.map((credit) => credit.eligible)).toEqual([true, false]);
    });

    it('keeps repeat budgets separate for different courses', () => {
        expect(
            evaluateRepeatability([enrollment('a'), enrollment('b', { courseId: 'COMPSCI198' })]).every(
                (credit) => credit.eligible
            )
        ).toBe(true);
    });

    it('retains a zero-unit course completion while still respecting count limits', () => {
        const result = evaluateRepeatability(['a', 'b'].map((id) => enrollment(id, { units: 0 })));
        expect(result.map((credit) => credit.eligible)).toEqual([true, false]);
        expect(completedCoursesFromCredits(result).COMPSCI199).toMatchObject({ count: 1, units: 0 });
    });
});

describe('per-enrollment overrides', () => {
    it('lets a later automatic enrollment count when the first is excluded', () => {
        const result = evaluateRepeatability([enrollment('failed', { countsForCredit: false }), enrollment('retake')]);
        expect(result.map((credit) => [credit.eligible, credit.overLimit])).toEqual([
            [false, false],
            [true, false],
        ]);
        expect(result[0].automaticallyCountsForCredit).toBe(true);
    });

    it('allows an explicit yes to exceed a non-repeatable course limit', () => {
        const result = evaluateRepeatability([
            enrollment('a'),
            enrollment('b', { countsForCredit: true }),
            enrollment('c'),
        ]);
        expect(result.map((credit) => credit.creditedUnits)).toEqual([4, 4, 0]);
        expect(result[1]).toMatchObject({ automaticallyCountsForCredit: false, eligible: true, overLimit: true });
    });

    it('allows explicit inclusion of the full units of a partially eligible repeat', () => {
        const result = evaluateRepeatability([
            enrollment('a', { repeatabilityTimes: 6, repeatabilityType: 'credit_hours' }),
            enrollment('b', { repeatabilityTimes: 6, repeatabilityType: 'credit_hours', countsForCredit: true }),
        ]);
        expect(totalEnrollmentCredit(result).unitCount).toBe(8);
        expect(result[1]).toMatchObject({ creditedUnits: 4, overLimit: true });
    });

    it('recalculates automatic eligibility when overrides are reset without changing the inputs', () => {
        const inputs = [enrollment('a'), enrollment('b', { countsForCredit: true })];
        expect(totalEnrollmentCredit(evaluateRepeatability(inputs)).unitCount).toBe(8);
        expect(inputs[1].countsForCredit).toBe(true);
        const reset = inputs.map((value) => ({ ...value, countsForCredit: undefined }));
        expect(totalEnrollmentCredit(evaluateRepeatability(reset)).unitCount).toBe(4);
        expect(inputs[1].countsForCredit).toBe(true);
    });

    it('leaves unit allowance available when an earlier enrollment earns no credit', () => {
        const result = evaluateRepeatability([
            enrollment('a', { repeatabilityTimes: 6, repeatabilityType: 'credit_hours', countsForCredit: false }),
            enrollment('b', { repeatabilityTimes: 6, repeatabilityType: 'credit_hours' }),
        ]);
        expect(result.map((credit) => credit.creditedUnits)).toEqual([0, 4]);
    });
});

describe('plan and transfer inputs', () => {
    it('uses academic order while preserving each enrollment’s UI location', () => {
        const plan = years();
        plan[0].quarters.reverse();
        const result = evaluateRepeatability(buildCourseEnrollments(plan, []));
        expect(result.map((credit) => [credit.id, credit.eligible])).toEqual([
            ['roadmap:0:1:0', true],
            ['roadmap:0:0:0', false],
        ]);
        expect(plan[0].quarters[0].name).toBe('Winter');
    });

    it('orders years by academic start year rather than their display position', () => {
        const later = { ...years()[0], startYear: 2027, quarters: [{ name: 'Fall' as const, courses: [course] }] };
        const earlier = { ...years()[0], startYear: 2026, quarters: [{ name: 'Fall' as const, courses: [course] }] };
        const result = evaluateRepeatability(buildCourseEnrollments([later, earlier], []));
        expect(result.map((credit) => [credit.id, credit.eligible])).toEqual([
            ['roadmap:1:0:0', true],
            ['roadmap:0:0:0', false],
        ]);
    });

    it('uses chosen variable units, including zero, without changing quarter workload totals', () => {
        const plan = years();
        plan[0].quarters[0].courses = [{ ...course, userChosenUnits: 0 }];
        const result = evaluateRepeatability(buildCourseEnrollments(plan, []));
        expect(result.map((credit) => credit.units)).toEqual([0, 4]);
        expect(totalEnrollmentCredit(result)).toEqual({ unitCount: 0, courseCount: 1 });
        expect(calculateTotalUnits(plan[0].quarters.flatMap((q) => q.courses))).toEqual({
            unitCount: 4,
            courseCount: 2,
        });
    });

    it('prioritizes already-earned transfer credit before planned repeats', () => {
        const result = evaluateRepeatability(
            buildCourseEnrollments(years(), [{ courseName: 'COMPSCI 199', units: 4, transferType: 'Course' }])
        );
        expect(result.map((credit) => credit.eligible)).toEqual([true, false, false]);
        expect(completedCoursesFromCredits(result).COMPSCI199).toMatchObject({
            count: 1,
            units: 4,
            transferType: 'Course',
        });
    });

    it('preserves already-earned aggregate transfer units', () => {
        const result = evaluateRepeatability(
            buildCourseEnrollments([], [{ courseName: 'COMPSCI 199', units: 8, transferType: 'Course' }])
        );
        expect(totalEnrollmentCredit(result).unitCount).toBe(8);
    });

    it('keeps zero-unit AP equivalencies eligible for course-count requirements', () => {
        const result = evaluateRepeatability(
            buildCourseEnrollments(years(), [{ courseName: 'COMPSCI 199', units: 0, transferType: 'AP' }])
        );
        expect(result.map((credit) => credit.eligible)).toEqual([true, false, false]);
        expect(completedCoursesFromCredits(result).COMPSCI199).toMatchObject({
            count: 1,
            units: 0,
            transferType: 'AP',
        });
    });

    it('does not add duplicate AP equivalencies or replace real transfer units with zero', () => {
        const result = evaluateRepeatability(
            buildCourseEnrollments(
                [],
                [
                    { courseName: 'COMPSCI 199', units: 4, transferType: 'Course' },
                    { courseName: 'COMPSCI 199', units: 0, transferType: 'AP' },
                    { courseName: 'MATH 2A', units: 0, transferType: 'AP' },
                    { courseName: 'MATH 2A', units: 0, transferType: 'AP' },
                ]
            )
        );
        expect(result).toHaveLength(2);
        expect(totalEnrollmentCredit(result)).toEqual({ unitCount: 4, courseCount: 2 });
    });

    it('excludes custom cards and loading placeholders from catalog repeat rules', () => {
        const plan = years();
        plan[0].quarters = [
            {
                name: 'Fall',
                courses: [LOADING_COURSE_PLACEHOLDER, { id: 2, courseName: 'Custom', units: 4, description: '' }],
            },
        ];
        expect(buildCourseEnrollments(plan, [])).toEqual([]);
    });

    it('aggregates every eligible repeated enrollment and counts its units once', () => {
        const result = evaluateRepeatability(['a', 'b', 'c'].map((id) => enrollment(id, { repeatabilityTimes: 2 })));
        expect(completedCoursesFromCredits(result).COMPSCI199).toMatchObject({ count: 2, units: 8 });
        expect(totalEnrollmentCredit(result)).toEqual({ unitCount: 8, courseCount: 2 });
    });
});
