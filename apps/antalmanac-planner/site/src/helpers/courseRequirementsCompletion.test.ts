import type { ProgramRequirement } from '@peterportal/types';

import { checkCompletion, collapseSingletonRequirements } from './courseRequirements';
import { completedCoursesFromCredits, evaluateRepeatability } from './repeatability';

const eligibleRepeats = completedCoursesFromCredits(
    evaluateRepeatability(
        [0, 1, 2].map((i) => ({
            id: String(i),
            source: 'roadmap',
            courseId: 'A',
            units: 4,
            repeatabilityTimes: 2,
            repeatabilityType: 'times',
        }))
    )
);
function courseRequirement(courses: string[], courseCount: number): ProgramRequirement<'Course'> {
    return { requirementId: 'courses', requirementType: 'Course', label: 'Courses', courses, courseCount };
}

it('counts eligible repeats toward flexible course-count requirements', () => {
    expect(checkCompletion(eligibleRepeats, courseRequirement(['A', 'B', 'C'], 2))).toEqual({
        required: 2,
        completed: 2,
        done: true,
    });
});

it('does not let repeating A replace a distinct mandatory course B', () => {
    expect(checkCompletion(eligibleRepeats, courseRequirement(['A', 'B'], 2))).toEqual({
        required: 2,
        completed: 1,
        done: false,
    });
});

it('supports a requirement for multiple enrollments in one course', () => {
    expect(checkCompletion(eligibleRepeats, courseRequirement(['A'], 2)).done).toBe(true);
});

it('only counts each mandatory enrollment once when a formatted list contains duplicate IDs', () => {
    expect(checkCompletion({ A: { count: 1, units: 4 } }, courseRequirement(['A', 'A'], 2)).done).toBe(false);
    expect(checkCompletion(eligibleRepeats, courseRequirement(['A', 'A'], 2)).done).toBe(true);
});

it('preserves legacy completion entries that omit an enrollment count', () => {
    expect(checkCompletion({ A: { units: 4 } }, courseRequirement(['A'], 1)).done).toBe(true);
});

it('sums capped eligible units for unit requirements', () => {
    const credit = completedCoursesFromCredits(
        evaluateRepeatability(
            [0, 1].map((i) => ({
                id: String(i),
                source: 'roadmap',
                courseId: 'A',
                units: 4,
                repeatabilityTimes: 6,
                repeatabilityType: 'credit_hours',
            }))
        )
    );
    const requirement: ProgramRequirement<'Unit'> = {
        requirementId: 'units',
        requirementType: 'Unit',
        label: 'Units',
        courses: ['A'],
        unitCount: 8,
    };
    expect(checkCompletion(credit, requirement)).toEqual({ required: 8, completed: 6, done: false });
});

it('keeps zero-unit equivalencies useful for course-count requirements', () => {
    expect(checkCompletion({ A: { count: 1, units: 0, transferType: 'AP' } }, courseRequirement(['A'], 1)).done).toBe(
        true
    );
});

it('does not collapse repeated-enrollment requirements into single-course requirements', () => {
    const repeated = courseRequirement(['A'], 2);
    const single = courseRequirement(['B'], 1);
    expect(collapseSingletonRequirements([repeated, single])).toEqual([repeated, single]);
});

it('combines GE category course and unit credit with eligible roadmap credit', () => {
    const ge = [{ geName: 'GE-2' as const, units: 8, numberOfCourses: 2 }];
    const course = { ...courseRequirement(['A', 'B', 'C'], 3), label: '3 courses category II' };
    expect(checkCompletion({ A: { count: 1, units: 4 } }, course, { geCredits: ge }).done).toBe(true);
    const unit: ProgramRequirement<'Unit'> = {
        requirementId: 'ge-units',
        requirementType: 'Unit',
        label: '3 courses category II',
        courses: ['A'],
        unitCount: 12,
    };
    expect(checkCompletion({ A: { units: 4 } }, unit, { geCredits: ge }).done).toBe(true);
});

it('propagates eligible credit and manual markers through nested groups', () => {
    const marker: ProgramRequirement<'Marker'> = {
        requirementId: 'marker',
        requirementType: 'Marker',
        label: 'Manual credit',
    };
    const group: ProgramRequirement<'Group'> = {
        requirementId: 'group',
        requirementType: 'Group',
        label: 'All',
        requirementCount: 2,
        requirements: [courseRequirement(['A'], 2), marker],
    };
    expect(checkCompletion(eligibleRepeats, group).done).toBe(false);
    expect(checkCompletion(eligibleRepeats, group, { completedMarkers: { 'Manual credit': true } }).done).toBe(true);
});
