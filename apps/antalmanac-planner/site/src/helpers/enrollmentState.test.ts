import { latestRoadmapVersion, roadmapDiffs, savedRoadmap } from '@peterportal/types';

import type { PlannerCourseData, RoadmapPlan } from '../types/types';
import { LOADING_COURSE_PLACEHOLDER } from './courseRequirements';
import { collapseAllPlanners, expandAllPlanners, loadRoadmap, saveRoadmap } from './planner';
import { compareRoadmaps, restoreRevision } from './roadmap';
import { addPlanner, modifyCourseEnrollmentState, modifyQuarterCourse, reorderQuarterCourse } from './roadmapEdits';
import { deepCopy, searchAPIResults } from './util';

jest.mock('./util', () => ({
    ...jest.requireActual('./util'),
    searchAPIResults: jest.fn(),
}));

const catalogCourse = { ...LOADING_COURSE_PLACEHOLDER, id: 'COMPSCI199', minUnits: 1, maxUnits: 4 };

function makePlan(): RoadmapPlan {
    return {
        id: 1,
        name: 'Research plan',
        content: {
            yearPlans: [
                {
                    startYear: 2026,
                    name: 'Year 1',
                    collapsed: false,
                    quarters: [
                        { name: 'Fall', courses: [{ ...catalogCourse, userChosenUnits: 2 }] },
                        { name: 'Winter', courses: [{ ...catalogCourse, userChosenUnits: 4 }] },
                    ],
                },
            ],
            invalidCourses: [],
        },
    };
}

function enrollment(plan: RoadmapPlan, quarter = 0, index = 0) {
    return plan.content.yearPlans[0].quarters[quarter].courses[index] as PlannerCourseData;
}

beforeEach(() => {
    localStorage.clear();
    jest.mocked(searchAPIResults).mockResolvedValue({ COMPSCI199: catalogCourse });
});

describe('per-enrollment state revisions', () => {
    it('changes only the selected placement of a repeated course and supports undo/redo', () => {
        const plans = [makePlan()];
        const revision = modifyCourseEnrollmentState(1, 2026, 'Fall', 0, enrollment(plans[0]), {
            countsForCredit: false,
        });
        restoreRevision(plans, [revision], -1, 0);
        expect(enrollment(plans[0])).toMatchObject({
            countsForCredit: false,
            userChosenUnits: 2,
        });
        expect(enrollment(plans[0], 1).countsForCredit).toBeUndefined();
        expect(catalogCourse).not.toHaveProperty('countsForCredit');
        restoreRevision(plans, [revision], 0, -1);
        expect(plans[0]).toEqual(makePlan());
        restoreRevision(plans, [revision], -1, 0);
        expect(enrollment(plans[0])).toMatchObject({ countsForCredit: false });
    });

    it('distinguishes automatic from an explicit yes and avoids unchanged revisions', () => {
        expect(modifyCourseEnrollmentState(1, 2026, 'Fall', 0, catalogCourse, {}).edits).toEqual([]);
        expect(
            modifyCourseEnrollmentState(1, 2026, 'Fall', 0, catalogCourse, { countsForCredit: undefined }).edits
        ).toEqual([]);
        expect(
            modifyCourseEnrollmentState(1, 2026, 'Fall', 0, catalogCourse, { countsForCredit: true }).edits
        ).toHaveLength(1);
        expect(
            modifyCourseEnrollmentState(
                1,
                2026,
                'Fall',
                0,
                { ...catalogCourse, countsForCredit: false },
                { countsForCredit: false }
            ).edits
        ).toEqual([]);
    });

    it('resets explicit credit to automatic and restores the choice through undo/redo', () => {
        const plans = [makePlan()];
        enrollment(plans[0]).countsForCredit = true;
        const revision = modifyCourseEnrollmentState(1, 2026, 'Fall', 0, enrollment(plans[0]), {
            countsForCredit: undefined,
        });
        restoreRevision(plans, [revision], -1, 0);
        expect(enrollment(plans[0]).countsForCredit).toBeUndefined();
        restoreRevision(plans, [revision], 0, -1);
        expect(enrollment(plans[0]).countsForCredit).toBe(true);
        restoreRevision(plans, [revision], -1, 0);
        expect(enrollment(plans[0]).countsForCredit).toBeUndefined();
    });

    it('keeps state attached when moving between quarters, including undo/redo', () => {
        const plans = [makePlan()];
        const course = enrollment(plans[0]);
        course.countsForCredit = false;
        const [fall, winter] = plans[0].content.yearPlans[0].quarters;
        const revision = modifyQuarterCourse(
            1,
            course,
            { startYear: 2026, quarter: fall, courseIndex: 0 },
            { startYear: 2026, quarter: winter, courseIndex: 1 }
        );
        restoreRevision(plans, [revision], -1, 0);
        expect(fall.courses).toHaveLength(0);
        expect(enrollment(plans[0], 1, 1)).toMatchObject({ countsForCredit: false });
        expect(enrollment(plans[0], 1, 0).countsForCredit).toBeUndefined();
        restoreRevision(plans, [revision], 0, -1);
        expect(enrollment(plans[0])).toMatchObject({ countsForCredit: false });
        restoreRevision(plans, [revision], -1, 0);
        expect(enrollment(plans[0], 1, 1)).toMatchObject({ countsForCredit: false });
    });

    it('keeps different states attached to identical course IDs when reordering', () => {
        const plans = [makePlan()];
        const quarter = plans[0].content.yearPlans[0].quarters[0];
        quarter.courses.push({ ...catalogCourse, countsForCredit: false });
        const course = enrollment(plans[0], 0, 1);
        const revision = reorderQuarterCourse(1, course, 1, { startYear: 2026, quarter, courseIndex: 0 });
        restoreRevision(plans, [revision], -1, 0);
        expect(enrollment(plans[0], 0, 0)).toMatchObject({ countsForCredit: false });
        expect(enrollment(plans[0], 0, 1).countsForCredit).toBeUndefined();
    });

    it('preserves enrollment state when duplicating a plan without linking the copies', () => {
        const plans = [makePlan()];
        enrollment(plans[0]).countsForCredit = false;
        const revision = addPlanner(-2, 'Duplicate', deepCopy(plans[0].content.yearPlans));
        restoreRevision(plans, [revision], -1, 0);
        expect(enrollment(plans[1])).toMatchObject({ countsForCredit: false });
        enrollment(plans[1]).countsForCredit = true;
        expect(enrollment(plans[0]).countsForCredit).toBe(false);
    });
});

describe('enrollment state persistence', () => {
    it('retains independent states through serialized roadmap export/import and expansion', async () => {
        const plan = makePlan();
        enrollment(plan).countsForCredit = false;
        enrollment(plan).userChosenUnits = 0;
        enrollment(plan, 1).countsForCredit = true;
        const saved = savedRoadmap.parse(
            JSON.parse(
                JSON.stringify({
                    version: latestRoadmapVersion,
                    planners: collapseAllPlanners([plan]),
                })
            )
        );
        const [expanded] = await expandAllPlanners(saved.planners);
        expect(enrollment(expanded)).toMatchObject({
            countsForCredit: false,
            userChosenUnits: 0,
        });
        expect(enrollment(expanded, 1)).toMatchObject({
            countsForCredit: true,
            userChosenUnits: 4,
        });
        expect(collapseAllPlanners([expanded])).toEqual(saved.planners);
    });

    it('retains settings through local save and reload', async () => {
        const plan = makePlan();
        enrollment(plan).countsForCredit = false;
        const result = await saveRoadmap(false, [], collapseAllPlanners([plan]), 0);
        expect(result.success).toBe(true);
        const { localRoadmap } = await loadRoadmap(false);
        const [reloaded] = await expandAllPlanners(localRoadmap.planners);
        expect(enrollment(reloaded)).toMatchObject({ countsForCredit: false });
        expect(enrollment(reloaded, 1).countsForCredit).toBeUndefined();
    });

    it('loads older version 5 plans with automatic credit eligibility', async () => {
        const saved = collapseAllPlanners([makePlan()]);
        for (const quarter of saved[0].content[0].quarters) {
            delete quarter.courses[0].countsForCredit;
        }
        const [expanded] = await expandAllPlanners(saved);
        expect(enrollment(expanded).countsForCredit).toBeUndefined();
        expect(enrollment(expanded, 1).countsForCredit).toBeUndefined();
        expect(compareRoadmaps(saved, collapseAllPlanners([expanded])).updatedQuarters).toEqual([]);
    });

    it.each([true, false, undefined])('includes a change to %s in validated account-save diffs', (nextValue) => {
        const plan = makePlan();
        if (nextValue === undefined) enrollment(plan).countsForCredit = true;
        const before = collapseAllPlanners([plan]);
        enrollment(plan).countsForCredit = nextValue;
        const diff = roadmapDiffs.parse(compareRoadmaps(before, collapseAllPlanners([plan])));
        expect(diff.updatedQuarters).toHaveLength(1);
        expect(diff.updatedQuarters[0].data.courses[0].countsForCredit).toBe(nextValue);
    });

    it('round-trips an automatic enrollment without turning it into an explicit yes', async () => {
        const saved = savedRoadmap.parse(
            JSON.parse(
                JSON.stringify({
                    version: latestRoadmapVersion,
                    planners: collapseAllPlanners([makePlan()]),
                })
            )
        );
        expect(saved.planners[0].content[0].quarters[0].courses[0]).not.toHaveProperty('countsForCredit');
        const [expanded] = await expandAllPlanners(saved.planners);
        expect(enrollment(expanded).countsForCredit).toBeUndefined();
    });

    it('keeps custom-card serialization compatible', async () => {
        const plan = makePlan();
        plan.content.yearPlans[0].quarters[0].courses.push({ id: 9, courseName: 'Custom', units: 2, description: '' });
        const saved = collapseAllPlanners([plan]);
        expect(saved[0].content[0].quarters[0].courses[1]).toEqual({ courseId: 'CUSTOM#9' });
        const [expanded] = await expandAllPlanners(saved);
        expect(expanded.content.yearPlans[0].quarters[0].courses[1]).toMatchObject({ id: 9, courseName: '' });
    });
});
