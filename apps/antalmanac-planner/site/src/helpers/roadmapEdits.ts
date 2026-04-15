import { QuarterName } from '@peterportal/types';
import { PlannerEdit, PlannerQuarterEdit, PlannerYearEdit, RoadmapPlan, RoadmapRevision } from '../types/roadmap';
import { CourseGQLData, PlannerQuarterData, PlannerYearData } from '../types/types';
import { createRevision } from './roadmap';
import { deepCopy } from './util';
import { LOADING_COURSE_PLACEHOLDER } from './courseRequirements';

// [action][Type][Property]
// Examples:
// addPlanner, removePlanner, updatePlannerName
// addQuarter, removeQuarter, updateQuarterCourses

function createInverseRevision(revision: RoadmapRevision) {
  revision.edits.forEach((edit) => {
    const before = edit.before;
    edit.before = edit.after;
    edit.after = before;
  });
  revision.edits.reverse();
  return revision;
}

export function addPlanner(id: number, name: string, yearPlans: PlannerYearData[]) {
  const plannerEdit: PlannerEdit = {
    type: 'planner',
    before: null,
    after: { id, name },
  };

  const otherEdits = yearPlans
    .flatMap((year) => addPlannerYear(id, year.startYear, year.name, year.quarters))
    .flatMap((revision) => revision.edits);

  return createRevision([plannerEdit, ...otherEdits]);
}

export function deletePlanner(id: number, name: string, yearPlans: PlannerYearData[]) {
  return createInverseRevision(addPlanner(id, name, yearPlans));
}

export function updatePlannerName(current: RoadmapPlan, newName: string) {
  const edit: PlannerEdit = {
    type: 'planner',
    before: { id: current.id, name: current.name },
    after: { id: current.id, name: newName },
  };
  return createRevision([edit]);
}

export function addPlannerYear(plannerId: number, startYear: number, name: string, quarters: PlannerQuarterData[]) {
  const yearEdit: PlannerYearEdit = {
    type: 'year',
    plannerId,
    before: null,
    after: { name, startYear },
  };

  const otherEdits = quarters
    .flatMap((quarter) => addPlannerQuarter(plannerId, startYear, quarter.name, quarter.courses))
    .flatMap((revision) => revision.edits);

  return createRevision([yearEdit, ...otherEdits]);
}

export function deletePlannerYear(plannerId: number, startYear: number, name: string, quarters: PlannerQuarterData[]) {
  return createInverseRevision(addPlannerYear(plannerId, startYear, name, quarters));
}

interface ModifyPlannerYearOptions {
  newName: string;
  newStartYear: number;
  removedQuarters: PlannerQuarterData[];
  addedQuarters: PlannerQuarterData[];
}
export function modifyPlannerYear(plannerId: number, currentYear: PlannerYearData, options: ModifyPlannerYearOptions) {
  const { name, startYear } = currentYear;
  const newStartYear = options.newStartYear ?? startYear;
  const edits = [];

  const removeQuarterEdits = options.removedQuarters
    .map((q) => createInverseRevision(addPlannerQuarter(plannerId, startYear, q.name, q.courses)))
    .flatMap((r) => r.edits);

  if (removeQuarterEdits) edits.push(...removeQuarterEdits);

  if (options.newName !== name || options.newStartYear !== startYear) {
    const yearEdit: PlannerYearEdit = {
      type: 'year',
      plannerId,
      before: { name, startYear },
      after: {
        name: options.newName ?? name,
        startYear: newStartYear,
      },
    };
    edits.push(yearEdit);
  }

  const addQuarterEdits = options.addedQuarters
    .map((q) => addPlannerQuarter(plannerId, newStartYear, q.name, q.courses))
    .flatMap((r) => r.edits);

  if (addQuarterEdits) edits.push(...addQuarterEdits);

  return createRevision(edits);
}

export function addPlannerQuarter(plannerId: number, startYear: number, name: QuarterName, courses: CourseGQLData[]) {
  const edit: PlannerQuarterEdit = {
    type: 'quarter',
    plannerId,
    startYear,
    before: null,
    after: { name, courses },
  };

  return createRevision([edit]);
}

export interface ModifiedQuarter {
  startYear: number;
  quarter: PlannerQuarterData;
  courseIndex: number;
}
export function modifyQuarterCourse(
  plannerId: number,
  course: CourseGQLData,
  removedFrom: ModifiedQuarter | null,
  addedTo: ModifiedQuarter | null,
) {
  const edits: PlannerQuarterEdit[] = [];

  if (removedFrom) {
    const coursesAfter = deepCopy(removedFrom.quarter.courses);
    coursesAfter.splice(removedFrom.courseIndex!, 1);

    edits.push({
      type: 'quarter',
      plannerId,
      startYear: removedFrom.startYear,
      before: deepCopy(removedFrom.quarter),
      after: {
        name: removedFrom.quarter.name,
        courses: coursesAfter,
      },
    });
  }

  if (addedTo) {
    // Remove course loading placeholders
    const quarterCopy = deepCopy(addedTo.quarter);
    quarterCopy.courses = addedTo.quarter.courses.filter((c) => c.id !== LOADING_COURSE_PLACEHOLDER.id);

    const coursesAfter = deepCopy(quarterCopy.courses);
    const index = addedTo.courseIndex;
    coursesAfter.splice(index, 0, course);

    edits.push({
      type: 'quarter',
      plannerId,
      startYear: addedTo.startYear,
      before: quarterCopy,
      after: { name: addedTo.quarter.name, courses: coursesAfter },
    });
  }

  return createRevision(edits);
}

export function reorderQuarterCourse(
  plannerId: number,
  course: CourseGQLData,
  oldIndex: number,
  after: ModifiedQuarter,
) {
  const quarterCopy = deepCopy(after.quarter);

  const coursesAfter = deepCopy(quarterCopy.courses);
  coursesAfter.splice(oldIndex, 1);
  coursesAfter.splice(after.courseIndex, 0, course);

  const edit: PlannerQuarterEdit = {
    type: 'quarter',
    plannerId,
    startYear: after.startYear,
    before: quarterCopy,
    after: { name: after.quarter.name, courses: coursesAfter },
  };
  return createRevision([edit]);
}
