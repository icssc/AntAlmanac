import {
  PlannerDiffs,
  PlannerQuarterDiffs,
  PlannerYearDiffs,
  quarters,
  RoadmapDiffs,
  PlannerSaveInfo,
  PlannerQuarterSaveInfo,
  PlannerQuarterDeletion,
  PlannerYearSaveInfo,
  PlannerYearDeletion,
  RoadmapItemDeletion,
  RoadmapSaveInfo,
  SavedPlannerData,
  SavedPlannerYearData,
  SavedPlannerQuarterData,
} from '@peterportal/types';
import {
  FullPlannerChangeData,
  PlannerQuarterChangeData,
  PlannerYearChangeData,
  RevisionDirection,
  RevisionStack,
  RoadmapEdit,
  RoadmapPlan,
  RoadmapRevision,
} from '../types/roadmap';
import { deepCopy } from './util';

export const createEmptyPlan = () => ({
  yearPlans: [],
  invalidCourses: [],
});

// Applying "revisions" to the roadmap

export function applyFullPlannerEdit(
  plans: RoadmapPlan[],
  oldData: FullPlannerChangeData,
  newData: FullPlannerChangeData,
): void {
  if (!oldData && !newData) return;

  if (!oldData) {
    plans.push({ ...newData!, content: createEmptyPlan() });
    return;
  }

  const planIndex = plans.findIndex((plan) => plan.id === oldData.id);
  if (!newData) {
    plans.splice(planIndex, 1);
    return;
  }

  Object.assign(plans[planIndex], newData);
}

export function applyYearEdit(
  plans: RoadmapPlan[],
  plannerId: number,
  oldData: PlannerYearChangeData,
  newData: PlannerYearChangeData,
) {
  if (!oldData && !newData) return;

  const planToEdit = plans.find((plan) => plan.id === plannerId);
  if (!planToEdit) return;

  const plannerYears = planToEdit.content.yearPlans;

  if (!oldData) {
    plannerYears.push({ ...newData!, quarters: [] });
    plannerYears.sort((a, b) => a.startYear - b.startYear);
    return;
  }

  const yearIndex = plannerYears.findIndex((year) => year.startYear === oldData.startYear);
  if (!newData) {
    plannerYears.splice(yearIndex, 1);
    return;
  }

  Object.assign(plannerYears[yearIndex], newData);
  plannerYears.sort((a, b) => a.startYear - b.startYear);
}

export function applyQuarterEdit(
  plans: RoadmapPlan[],
  plannerId: number,
  startYear: number,
  oldData: PlannerQuarterChangeData,
  newData: PlannerQuarterChangeData,
) {
  if (!oldData && !newData) return;

  const planToEdit = plans.find((plan) => plan.id === plannerId);
  const yearToEdit = planToEdit?.content?.yearPlans?.find((year) => year.startYear === startYear);
  if (!yearToEdit) return;

  if (!oldData) {
    yearToEdit.quarters.push(newData!);
    yearToEdit.quarters.sort((a, b) => quarters.indexOf(a.name) - quarters.indexOf(b.name));
    return;
  }

  const quarterIndex = yearToEdit.quarters.findIndex((q) => q.name === oldData.name);
  if (!newData) {
    yearToEdit.quarters.splice(quarterIndex, 1);
    return;
  }

  // the only data you can change about a quarter is the courses
  yearToEdit.quarters[quarterIndex].courses = newData.courses;
}

// Traversing the revision stack
function getRevisionStack(history: RoadmapRevision[], start: number, end: number): RevisionStack {
  // Track number of positions changed
  const steps = end - start;
  const first = Math.min(end, start) + 1;
  const last = Math.max(end, start) + 1;
  const direction: RevisionDirection = Math.sign(steps) === -1 ? 'undo' : 'redo';

  // How edits are grouped has no effect on how we apply them, so flatten revisions into their edits
  const edits = history.slice(first, last).flatMap((r) => deepCopy(r.edits));

  // Reverse the order if needed; undo starts with latest and redo starts with earliest
  if (direction === 'undo') edits.reverse();

  return { edits, direction };
}

function updatePlannerFromRevisionStack(planners: RoadmapPlan[], stack: RevisionStack) {
  stack.edits.forEach((edit) => {
    const oldKey = stack.direction === 'undo' ? 'after' : 'before';
    const newKey = stack.direction === 'undo' ? 'before' : 'after';

    switch (edit.type) {
      case 'planner':
        return applyFullPlannerEdit(planners, edit[oldKey], edit[newKey]);
      case 'year':
        return applyYearEdit(planners, edit.plannerId, edit[oldKey], edit[newKey]);
      case 'quarter': {
        return applyQuarterEdit(planners, edit.plannerId, edit.startYear, edit[oldKey], edit[newKey]);
      }
    }
  });
}

/**
 * Applies the provided revisions in-place on the planners argument
 * @param start The index of the first revision to be applied
 * @param end The index of the last revision to be applied
 */
export function restoreRevision(
  planners: RoadmapPlan[],
  revisionHistory: RoadmapRevision[],
  start: number,
  end: number,
) {
  const stack = getRevisionStack(revisionHistory, start, end);
  updatePlannerFromRevisionStack(planners, stack);
}

export function createRevision(edits: RoadmapEdit[]): RoadmapRevision {
  return { timestamp: Date.now(), edits };
}

// Comparing Roadmap States
type CollapsedRoadmapItem = SavedPlannerData | SavedPlannerYearData | SavedPlannerQuarterData;

function removeContentKeys<T extends CollapsedRoadmapItem>(dataContainer: T) {
  if ('content' in dataContainer) return { ...dataContainer, content: undefined };
  if ('quarters' in dataContainer) return { ...dataContainer, quarters: undefined };
  return dataContainer;
}

function findNotInOther<T>(otherList: T[], matchingKey: keyof T) {
  return (item: T) => !otherList.find((otherItem) => otherItem[matchingKey] === item[matchingKey]);
}

/**
 * Based on two lists of roadmap data (i.e. PlannerQuarters), returns which ones have been deleted from
 * the `before` list, are newly added to the `after` list, or exist in both lists.
 *
 * @param before The list of contained items from before making changes, i.e. old quarters data
 * inside of a planner year
 * @param after The list of contained items from after making changes, i.e. new quarters data
 * inside of a planner year
 * @param itemIdKey The key used to identify items within the previously mentioned lists, i.e.
 * "name" if `before` and `after` are lists of PlannerQuarter
 * @param parentIdentifier The set of keys needed to define where the edit occurred, i.e. the
 * plannerId of the planner and startYear of the year that contains quarters being compared.
 * @returns Lists of removed items, added items, and matching items based on the `before` and `after` lists
 */
function getDiffsAndPairs<C extends CollapsedRoadmapItem, Del extends Omit<RoadmapItemDeletion, 'id'>>(
  before: C[],
  after: C[],
  itemIdKey: keyof C,
  parentIdentifier: Del,
) {
  type IdType = Del extends Omit<PlannerQuarterDeletion, 'id'> ? string : number;
  type SaveType = Extract<RoadmapSaveInfo, Del & { data: Record<typeof itemIdKey, unknown> }>;

  const removed = before
    .filter(findNotInOther(after, itemIdKey))
    .map((item) => ({ ...parentIdentifier, id: item[itemIdKey] as IdType }));

  const added: SaveType[] = after
    .filter(findNotInOther(before, itemIdKey))
    .map((item) => ({ ...parentIdentifier, data: removeContentKeys(item) }) as SaveType);

  const pairs = after.map((item) => [before.find((x) => x[itemIdKey] === item[itemIdKey]) ?? null, item] as const);

  return { removed, added, pairs, test: [] as SaveType[] };
}

/**
 * Adds the quarter being compared to the `updatedQuarters` list if the courses do not match exactly
 */
function comparePlannerQuarterPair(
  before: SavedPlannerQuarterData | null,
  after: SavedPlannerQuarterData,
  plannerId: number,
  startYear: number,
  plannerDiffs: PlannerQuarterDiffs,
) {
  if (!before) return;

  /** @todo update logic here after adding support for variable units */
  const hasSameCourses =
    before.courses.every((course, index) => course === after.courses[index]) &&
    after.courses.every((course, index) => course === before.courses[index]);
  if (hasSameCourses) return;

  const quarterUpdate = { name: after.name, courses: after.courses };
  plannerDiffs.updatedQuarters.push({ plannerId, startYear, data: quarterUpdate });
}

/**
 * Given the before and after state of a Planner Year, this function lists which quarters have been added,
 * deleted, or modified.
 * @param before The previous planner year, if it exists. Similar to `comparePlannerPair`, calling with `null`
 * will occur when we need to create new quarters for a "to-be-created" planner year.
 */
function comparePlannerYearPair(
  before: SavedPlannerYearData | null,
  after: SavedPlannerYearData,
  plannerId: number,
  plannerDiffs: PlannerYearDiffs,
) {
  const yearEditsIdentifier = { plannerId, startYear: after.startYear };
  const { removed, added, pairs } = getDiffsAndPairs(
    before?.quarters ?? [],
    after.quarters,
    'name',
    yearEditsIdentifier,
  );

  pairs.forEach(([oldYear, newYear]) =>
    comparePlannerQuarterPair(oldYear, newYear, plannerId, after.startYear, plannerDiffs),
  );

  if (before && before.name !== after.name) {
    const yearUpdate = { name: after.name, startYear: after.startYear };
    plannerDiffs.updatedYears.push({ data: yearUpdate, plannerId });
  }

  plannerDiffs.deletedQuarters.push(...removed);
  plannerDiffs.newQuarters.push(...added);
}

/**
 * Given the before and after state of a Planner, this function lists which years have been added, deleted,
 * or modified. In doing so, it will also list changes associated wtih specific quarters in that Planner Year.
 * @param before The previous planner data, if it exists. A call to `comparePlannerPair` with `before = null`
 * must occur in order to create years for a planner that will exist after save (but has not been created yet).
 */
function comparePlannerPair(before: SavedPlannerData | null, after: SavedPlannerData, plannerDiffs: PlannerDiffs) {
  const beforeYears = before?.content ?? [];
  const afterYears = after.content;

  const yearEditsIdentifier = { plannerId: after.id };
  const { removed, added, pairs } = getDiffsAndPairs(beforeYears, afterYears, 'startYear', yearEditsIdentifier);

  pairs.forEach(([oldYear, newYear]) => comparePlannerYearPair(oldYear, newYear, after.id, plannerDiffs));

  if (before && before.name !== after.name) {
    const plannerUpdate = { id: after.id, name: after.name };
    plannerDiffs.updatedPlanners.push({ data: plannerUpdate });
  }

  plannerDiffs.deletedYears.push(...removed);
  plannerDiffs.newYears.push(...added);
}

/**
 * Generates a list of changes to all user Roadmaps, given a before and after state.
 * @returns Lists of creations, deletions, and modifications for planners, years, and quarters. Database
 * updates using these changes should be performed as such: deletes from small (quarter) to large (planner),
 * then modifications from small to large, then creates from large to small.
 */
export function compareRoadmaps(before: SavedPlannerData[], after: SavedPlannerData[]): RoadmapDiffs {
  const roadmapEditsIdentifier = {};
  const {
    removed: deletedPlanners,
    added: newPlanners,
    pairs: matchingPlanners,
  } = getDiffsAndPairs(before, after, 'id', roadmapEditsIdentifier);

  const updatedPlanners: PlannerSaveInfo[] = [];
  const updatedYears: PlannerYearSaveInfo[] = [];
  const updatedQuarters: PlannerQuarterSaveInfo[] = [];
  const newYears: PlannerYearSaveInfo[] = [];
  const newQuarters: PlannerQuarterSaveInfo[] = [];
  const deletedYears: PlannerYearDeletion[] = [];
  const deletedQuarters: PlannerQuarterDeletion[] = [];

  const plannerDiffs: PlannerDiffs = {
    deletedQuarters,
    deletedYears,
    updatedQuarters,
    updatedYears,
    updatedPlanners,
    newYears,
    newQuarters,
  };

  matchingPlanners.forEach(([before, after]) => comparePlannerPair(before, after, plannerDiffs));

  return {
    deletedPlanners,
    newPlanners,
    ...plannerDiffs,
  };
}
