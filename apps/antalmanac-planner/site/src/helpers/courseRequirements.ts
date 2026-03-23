import {
  GEName,
  GETitle,
  MajorProgram,
  MajorSpecialization,
  MinorProgram,
  ProgramRequirement,
  TransferredGE,
} from '@peterportal/types';
import { CourseGQLData } from '../types/types';
import { Theme } from 'react-select';
import { useAppSelector } from '../store/hooks';
import trpc from '../trpc';
import { useTransferredCredits, TransferredCourseWithType } from '../hooks/transferCredits';
import { getCssVariable } from './styling';

export const COMPLETE_ALL_TEXT = 'Complete all of the following';
export const LOADING_COURSE_PLACEHOLDER: CourseGQLData = {
  id: 'Loading...',
  department: 'Loading...',
  courseNumber: '',
  courseNumeric: 0,
  school: '',
  title: 'Loading...',
  courseLevel: 'Lower Division (1-99)',
  minUnits: 0,
  maxUnits: 0,
  description: '',
  departmentName: '',
  prerequisiteTree: {
    AND: undefined,
    OR: undefined,
    NOT: undefined,
  },
  prerequisiteText: '',
  repeatability: '',
  gradingOption: '',
  concurrent: '',
  sameAs: '',
  restriction: '',
  overlap: '',
  corequisites: '',
  geList: [],
  geText: '',
  terms: [],
  instructors: {},
  prerequisites: {},
  dependents: {},
};
export const GE_TITLE_MAP: Record<GEName, GETitle> = {
  'GE-1A': 'GE Ia: Lower Division Writing',
  'GE-1B': 'GE Ib: Upper Division Writing',
  'GE-2': 'GE II: Science and Technology',
  'GE-3': 'GE III: Social & Behavioral Sciences',
  'GE-4': 'GE IV: Arts and Humanities',
  'GE-5A': 'GE Va: Quantitative Literacy',
  'GE-5B': 'GE Vb: Formal Reasoning',
  'GE-6': 'GE VI: Language Other Than English',
  'GE-7': 'GE VII: Multicultural Studies',
  'GE-8': 'GE VIII: International/Global Issues',
};

/** A RegEx for GE labels in Degree Requirements */
const GE_LABEL_REGEX = /^\d courses? category ([iv]+[ab]?)$|^([iv]+[ab]?)\. (\w.*)/i;

export const comboboxTheme = (theme: Theme, darkMode: boolean) => {
  const themeCopy = { ...theme, colors: { ...theme.colors } };

  themeCopy.colors.primary = getCssVariable('--mui-palette-secondary-main'); // box border
  themeCopy.colors.primary50 = getCssVariable('--mui-palette-secondary-main'); // active
  themeCopy.colors.primary25 = `color-mix(in oklab, var(--mui-palette-primary-main) 50%, transparent)`; // hover

  if (darkMode) {
    const neutralIncrements = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90];
    Object.entries(theme.colors).forEach(([key]) => {
      if (key.startsWith('neutral')) {
        const index = neutralIncrements.indexOf(parseInt(key.replace('neutral', '')));
        const opposite = ('neutral' + neutralIncrements.at(-1 - index)) as keyof Theme['colors'];
        themeCopy.colors[key as keyof Theme['colors']] = theme.colors[opposite];
      }
    });
  }

  return themeCopy;
};

/**
 * Groups consectutive single-course requirements into one group requirement where all courses must be completed
 * @param requirements The raw course requirements, as returned from the API
 */
export function collapseSingletonRequirements(requirements: ProgramRequirement[]) {
  let builtGroup: ProgramRequirement<'Group'> | null = null;

  const computedRequirements: ProgramRequirement[] = [];

  const addBuiltGroup = () => {
    if (builtGroup?.requirements?.length === 1) {
      computedRequirements.push(builtGroup.requirements[0]);
    } else if (builtGroup) {
      const courseReqs: ProgramRequirement<'Course'> = {
        requirementType: 'Course',
        label: builtGroup.label,
        courseCount: builtGroup.requirementCount,
        requirementId: builtGroup.requirementId,
        courses: (builtGroup.requirements as ProgramRequirement<'Course'>[]).map((c) => c.courses[0]),
      };
      computedRequirements.push(courseReqs);
    }
  };

  for (const r of requirements) {
    if (r.requirementType !== 'Course' || r.courses.length !== 1) {
      addBuiltGroup();
      builtGroup = null;

      computedRequirements.push(r);
      continue;
    }

    builtGroup ??= {
      requirementType: 'Group',
      requirementCount: 0,
      label: COMPLETE_ALL_TEXT,
      requirements: [],
      requirementId: r.requirementId,
    };
    builtGroup.requirements.push(r);
    builtGroup.requirementCount++;
  }

  addBuiltGroup();
  return computedRequirements;
}

/**
 * Flattens requirements to prevent deep nesting.
 * Preserves the titles of the top-level categories by default.
 *
 * @param requirements Nested requirements to flatten.
 * @param preserveOuterLabels If labels of highest-level categories should not be changed. Defaults to true.
 * @returns Flattened requirements.
 */
export function flattenSingletonGroups(
  requirements: ProgramRequirement[],
  preserveOuterLabels = true,
): ProgramRequirement[] {
  const res = requirements.flatMap((r) => {
    if (r.requirementType !== 'Group' || r.requirementCount !== r.requirements.length || r.requirementCount > 1) {
      return r;
    }
    return flattenSingletonGroups(r.requirements, false);
  });
  if (preserveOuterLabels) {
    // Map to new objects since we Can't modify label directly because it's read-only
    return res.map((r, i) => ({
      ...r,
      label: requirements[i].label,
    }));
  }
  return res;
}

/**
 * Sorts Group Requirements such that Markers appear first. This is so the user can see alternatives to
 * completing entire course lists without having to scroll past the course lists first
 * @param requirements The program requirements list
 */
export function sortGroupRequirementsByType(requirements: ProgramRequirement[]): ProgramRequirement[] {
  return requirements
    .map((r) => {
      if (r.requirementType !== 'Group') return r;
      return { ...r, requirements: sortGroupRequirementsByType(r.requirements) };
    })
    .sort((a, b) => {
      const aIsMarker = a.requirementType === 'Marker';
      const bIsMarker = b.requirementType === 'Marker';
      return Number(bIsMarker) - Number(aIsMarker);
    });
}

export function coerceEmptyRequirement(requirement: ProgramRequirement): ProgramRequirement {
  if (requirement.requirementType === 'Course' && !requirement.courses.length) {
    // Some course requirements don't provide a list of courses from the API. For these cases,
    // treat them as a Marker so the user can manually mark as complete.
    return {
      requirementType: 'Marker',
      label: requirement.label,
      requirementId: requirement.requirementId,
    };
  } else {
    return requirement;
  }
}

function coerceEmptyRequirements(requirements: ProgramRequirement[]): ProgramRequirement[] {
  return requirements.map((r) => {
    if (r.requirementType !== 'Group') return coerceEmptyRequirement(r);
    requirements = coerceEmptyRequirements(r.requirements);
    return { ...r, requirements };
  });
}

export function formatRequirements(
  requirements: ProgramRequirement[],
  skipCollapseSingletons?: boolean,
): ProgramRequirement[] {
  const pipeline = [
    ...(skipCollapseSingletons ? [] : [collapseSingletonRequirements]),
    flattenSingletonGroups,
    coerceEmptyRequirements,
    sortGroupRequirementsByType,
  ];
  for (const transform of pipeline) {
    requirements = transform(requirements);
  }
  return requirements;
}

export function normalizeMajorName(program: MajorProgram | MinorProgram | MajorSpecialization) {
  return program.name.replace(/^(p[.\s]?h[.\s]?d[.\s]?|m[.\s]?a[.\s]?|major) in\s?/i, '');
}

export interface CompletedCourseSet {
  [k: string]: {
    units: number;
    transferType?: TransferredCourseWithType['transferType'];
  };
}

export interface CompletionStatus {
  required: number;
  completed: number;
  done: boolean;
}

function getMatchingGECategory(label: string) {
  const labelMatch = label.match(GE_LABEL_REGEX);
  if (!labelMatch) return null;

  // Refer to the RegEx constant to see what these match. There will either be an identifier OR number + title
  const [categoryIdentifier, categoryNumber, categoryTitle] = labelMatch.slice(1);

  const categoryEntries = Object.entries(GE_TITLE_MAP);
  const filterFunction = categoryIdentifier
    ? (title: GETitle) => title.startsWith(`GE ${categoryIdentifier}: `)
    : (title: GETitle) => title === `GE ${categoryNumber}: ${categoryTitle}`;

  // key of the matching entry, if it exists
  return categoryEntries.find((ent: [string, GETitle]) => filterFunction(ent[1]))?.[0] ?? null;
}

function findMatchingGETransfers(requirement: ProgramRequirement, transferredGEs: TransferredGE[]): TransferredGE[] {
  const matches: TransferredGE[] = [];

  const applicableGE = getMatchingGECategory(requirement.label.trim());
  const selfMatch =
    transferredGEs.find((ge) => ge.geName === applicableGE && (ge.numberOfCourses > 0 || ge.units > 0)) ?? null;
  if (selfMatch) {
    matches.push(selfMatch);
    return matches;
  }

  if (requirement.requirementType === 'Group') {
    for (const child of requirement.requirements) {
      matches.push(...findMatchingGETransfers(child, transferredGEs));
    }
  }

  return matches;
}

export function useMatchingGETransfers(requirement: ProgramRequirement): TransferredGE[] {
  const transferredGEs = useTransferredCredits().ge;

  return findMatchingGETransfers(requirement, transferredGEs);
}

function checkCourseListCompletion(
  completed: CompletedCourseSet,
  requirement: ProgramRequirement<'Course'>,
): CompletionStatus {
  const completedCount = requirement.courses.filter((c) => c in completed).length;
  const required = requirement.courseCount;

  return { required, completed: completedCount, done: completedCount >= required };
}

function useCourseListCompletionCheck(
  completed: CompletedCourseSet,
  requirement: ProgramRequirement,
): CompletionStatus {
  const geCredits = useTransferredCredits().ge;
  if (requirement.requirementType !== 'Course') return { required: 0, completed: 0, done: false };

  const required = requirement.courseCount;
  const applicableGE = getMatchingGECategory(requirement.label.trim());
  const transferCompleted = geCredits.find((ge) => ge.geName === applicableGE)?.numberOfCourses ?? 0;
  const roadmapCompleted = requirement.courses.filter((c) => c in completed).length;

  const completedCount = roadmapCompleted + transferCompleted;

  return { required, completed: completedCount, done: completedCount >= required };
}

function checkGroupCompletion(
  completed: CompletedCourseSet,
  requirement: ProgramRequirement<'Group'>,
): CompletionStatus {
  const checkIsDone = (req: ProgramRequirement) => checkCompletion(completed, req).done;
  const completedGroups = requirement.requirements.filter(checkIsDone).length;
  const required = requirement.requirementCount;
  return { required, completed: completedGroups, done: completedGroups >= required };
}

function useGroupCompletionCheck(completed: CompletedCourseSet, requirement: ProgramRequirement): CompletionStatus {
  const useIsDone = (req: ProgramRequirement) => useCompletionCheck(completed, req).done;
  if (requirement.requirementType !== 'Group') return { required: 0, completed: 0, done: false };

  const completedGroups = requirement.requirements.filter(useIsDone).length;
  const required = requirement.requirementCount;
  return { required, completed: completedGroups, done: completedGroups >= required };
}

function checkUnitCompletion(completed: CompletedCourseSet, requirement: ProgramRequirement<'Unit'>): CompletionStatus {
  const required = requirement.unitCount;
  const completedCourses = requirement.courses.filter((c) => c in completed);
  const completedUnits = completedCourses.map((c) => completed[c]).reduce((a, b) => a + b.units, 0);
  return { required, completed: completedUnits, done: completedUnits >= required };
}

export function checkCompletion(completed: CompletedCourseSet, requirement: ProgramRequirement): CompletionStatus {
  switch (requirement.requirementType) {
    case 'Group':
      return checkGroupCompletion(completed, requirement);
    case 'Course':
      return checkCourseListCompletion(completed, requirement);
    case 'Unit':
      return checkUnitCompletion(completed, requirement);
    case 'Marker':
      return { completed: 0, done: false, required: 0 };
  }
}

export function useCompletionCheck(completed: CompletedCourseSet, requirement: ProgramRequirement): CompletionStatus {
  const completedMarkers = useAppSelector((state) => state.courseRequirements.completedMarkers);
  const groupComplete = useGroupCompletionCheck(completed, requirement);
  const courseComplete = useCourseListCompletionCheck(completed, requirement);

  switch (requirement.requirementType) {
    case 'Group':
      return groupComplete;
    case 'Course':
      return courseComplete;
    case 'Unit':
      return checkUnitCompletion(completed, requirement);
    case 'Marker':
      return { completed: 0, done: completedMarkers[requirement.label], required: 0 };
  }
}

export async function loadMarkerCompletion(isLoggedIn: boolean): Promise<string[]> {
  if (isLoggedIn) {
    const response = await trpc.courseRequirements.getCompletedMarkers.query();
    return response.map((r) => r.markerName);
  } else {
    let completedMarkers: string[] = [];
    try {
      completedMarkers = JSON.parse(localStorage.roadmap__savedMarkers);
    } catch {
      /* ignore */
    }
    return completedMarkers;
  }
}

export async function saveMarkerCompletion(markerName: string, complete: boolean, isLoggedIn: boolean): Promise<void> {
  if (isLoggedIn) {
    const operationName = complete ? 'addCompletedMarker' : 'removeCompletedMarker';
    const operation = trpc.courseRequirements[operationName];
    await operation.mutate(markerName);
  } else {
    const completedMarkers = new Set(await loadMarkerCompletion(false));
    completedMarkers[complete ? 'add' : 'delete'](markerName);
    localStorage.roadmap__savedMarkers = JSON.stringify([...completedMarkers]);
  }
}
