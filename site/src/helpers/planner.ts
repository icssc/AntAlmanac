import {
  LegacyRoadmap,
  PrerequisiteNode,
  QuarterName,
  quarters,
  SavedPlannerData,
  SavedPlannerQuarterData,
  SavedPlannerYearData,
  SavedRoadmap,
  LegacyTransfer,
  TransferredAPExam,
  TransferredCourse,
  TransferredUncategorized,
  Prerequisite,
  PrerequisiteTree,
} from '@peterportal/types';
import { searchAPIResults } from './util';
import { defaultPlan } from '../store/slices/roadmapSlice';
import {
  BatchCourseData,
  InvalidCourseData,
  PlannerData,
  PlannerQuarterData,
  PlannerYearData,
  RoadmapPlan,
} from '../types/types';
import trpc from '../trpc';
import { LocalTransferSaveKey, saveLocalTransfers } from './transferCredits';
import { compareRoadmaps } from './roadmap';

export function defaultYear() {
  const quarterNames: QuarterName[] = ['Fall', 'Winter', 'Spring'];
  return {
    startYear: new Date().getFullYear(),
    name: 'Year 1',
    quarters: quarterNames.map((quarter) => {
      return { name: quarter, courses: [] };
    }),
  } as PlannerYearData | SavedPlannerYearData;
}

export const quarterDisplayNames: Record<QuarterName, string> = {
  Fall: 'Fall',
  Winter: 'Winter',
  Spring: 'Spring',
  Summer1: 'Summer I',
  Summer2: 'Summer II',
  Summer10wk: 'Summer 10 Week',
};

export function normalizeQuarterName(name: string): QuarterName {
  if (quarters.includes(name as QuarterName)) return name as QuarterName;
  const lookup: { [k: string]: QuarterName } = {
    fall: 'Fall',
    winter: 'Winter',
    spring: 'Spring',
    // Old Lowercase Display Names
    'summer I': 'Summer1',
    'summer II': 'Summer2',
    'summer 10 Week': 'Summer10wk',
    // Transcript Names
    'First Summer': 'Summer1',
    'Second Summer': 'Summer2',
    'Special / 10-Week Summer': 'Summer10wk',
  };
  if (!lookup[name]) throw TypeError('Invalid Quarter Name: ' + name);
  return lookup[name];
}

export const makeUniquePlanName = (plannerName: string, allPlans: RoadmapPlan[]): string => {
  let newName = plannerName;
  while (allPlans.find((p) => p.name === newName)) {
    // The regex matches an integer number at the end
    const counter = newName.match(/\d+$/);
    if (counter != null) {
      const numberValue = newName.substring(counter.index!);
      newName = newName.substring(0, counter.index) + (parseInt(numberValue) + 1);
    } else {
      // No number exists at the end, so default with 2
      newName += ' 2';
    }
  }
  return newName;
};

// remove all unecessary data to store into the database
export const collapsePlanner = (planner: PlannerData): SavedPlannerYearData[] => {
  const savedPlanner: SavedPlannerYearData[] = [];
  planner.forEach((year) => {
    const savedYear: SavedPlannerYearData = { startYear: year.startYear, name: year.name, quarters: [] };
    year.quarters.forEach((quarter) => {
      const savedQuarter: SavedPlannerQuarterData = { name: quarter.name, courses: [] };
      savedQuarter.courses = quarter.courses.map((course) => course.id);
      savedYear.quarters.push(savedQuarter);
    });
    savedPlanner.push(savedYear);
  });
  return savedPlanner;
};

export const collapseAllPlanners = (plans: RoadmapPlan[]): SavedPlannerData[] => {
  return plans.map((p) => ({
    id: p.id,
    name: p.name,
    content: collapsePlanner(p.content.yearPlans),
    chc: p.chc,
  }));
};

// query the lost information from collapsing

export const expandPlanner = async (savedPlanner: SavedPlannerYearData[]): Promise<PlannerData> => {
  let courses: string[] = [];
  // get all courses in the planner
  savedPlanner.forEach((year) =>
    year.quarters.forEach((quarter) => {
      courses = courses.concat(quarter.courses);
    }),
  );
  // get the course data for all courses
  let courseLookup: BatchCourseData = {};
  // only send request if there are courses
  if (courses.length > 0) {
    courseLookup = await searchAPIResults('courses', courses);
  }

  return new Promise((resolve) => {
    const planner: PlannerData = [];

    savedPlanner.forEach((savedYear) => {
      const year: PlannerYearData = { startYear: savedYear.startYear, name: savedYear.name, quarters: [] };

      savedYear.quarters.forEach((savedQuarter) => {
        const quarter: PlannerQuarterData = { name: savedQuarter.name, courses: [] };

        quarter.courses = savedQuarter.courses.map((courseId) => courseLookup[courseId]).filter((course) => !!course);

        year.quarters.push(quarter);
      });

      planner.push(year);
    });
    resolve(planner);
  });
};

export const expandAllPlanners = async (plans: SavedPlannerData[]): Promise<RoadmapPlan[]> => {
  return await Promise.all(
    plans.map(async (p) => {
      const yearPlans = await expandPlanner(p.content);
      const planContent = { yearPlans, invalidCourses: [] };
      return { id: p.id, name: p.name, content: planContent, chc: p.chc };
    }),
  );
};

type LocalStorageRoadmapType = SavedRoadmap | LegacyRoadmap;

export function readLocalRoadmap<T extends LocalStorageRoadmapType>(): T {
  const emptyRoadmap: SavedRoadmap = {
    planners: [
      {
        id: -1,
        name: defaultPlan.name,
        content: [defaultYear() as SavedPlannerYearData],
      },
    ],
  };

  let localRoadmap: SavedRoadmap | LegacyRoadmap | null = null;
  try {
    localRoadmap = JSON.parse(localStorage.roadmap);
  } catch {
    /* ignore */
  }

  return (localRoadmap ?? emptyRoadmap) as T;
}

// Adding Multiplan
function addMultiPlanToRoadmap(roadmap: SavedRoadmap | LegacyRoadmap): SavedRoadmap {
  if ('planners' in roadmap) {
    // if already in multiplanner format, everything is good
    return roadmap;
  } else {
    // if not, convert to multiplanner format, also normalize quarter names
    return {
      planners: [
        {
          id: -1,
          name: defaultPlan.name,
          content: normalizePlannerQuarterNames((roadmap as { planner: SavedPlannerYearData[] }).planner),
        },
      ],
      transfers: roadmap.transfers,
      timestamp: roadmap.timestamp,
    };
  }
}

// Upgrading Transfers
async function saveUpgradedTransfers(roadmapToSave: SavedRoadmap, transfers: LegacyTransfer[]) {
  if (!transfers.length) return false; // nothing to convert

  const response = await trpc.transferCredits.convertUserLegacyTransfers.query(transfers);
  const { courses, ap, other } = response;

  const scoredAPs = ap.map(({ score, ...other }) => ({ ...other, score: score ?? 1 }));
  const formattedOther = other.map(({ courseName: name, units }) => ({ name, units }));

  saveLocalTransfers<TransferredCourse>(LocalTransferSaveKey.Course, courses);
  saveLocalTransfers<TransferredAPExam>(LocalTransferSaveKey.AP, scoredAPs);
  saveLocalTransfers<TransferredUncategorized>(LocalTransferSaveKey.Uncategorized, formattedOther);

  // immediately update localStorage to not have transfers, now that we've converted them
  localStorage.setItem('roadmap', JSON.stringify(roadmapToSave));
  return true;
}

/**
 * Updates the format of transferred credits in localStorage before data is used by other parts of the app
 * @param roadmap The roadmap whose transfers to upgrade
 */
async function upgradeLegacyTransfers(roadmap: SavedRoadmap): Promise<SavedRoadmap> {
  const legacyTransfers = roadmap.transfers ?? [];
  const updatedRoadmap = { ...roadmap };
  delete updatedRoadmap.transfers;
  const complete = await saveUpgradedTransfers(updatedRoadmap, legacyTransfers);
  return complete ? updatedRoadmap : roadmap;
}

// Adding IDs to roadmaps
function addIdsToLocalRoadmap(roadmap: SavedRoadmap): SavedRoadmap {
  let nextId = Math.min(0, ...roadmap.planners.map((p) => p.id ?? 0)) - 1;
  roadmap.planners.forEach((p) => {
    if (p.id) return;
    p.id = nextId;
    nextId--;
  });
  return roadmap;
}

// Upgrading Entire Roadmap
async function upgradeLocalRoadmap(): Promise<SavedRoadmap> {
  const localRoadmap = readLocalRoadmap();
  const roadmapWithMultiPlan = addMultiPlanToRoadmap(localRoadmap);
  const roadmapWithoutLegacyTransfers = await upgradeLegacyTransfers(roadmapWithMultiPlan);
  const roadmapWithIds = addIdsToLocalRoadmap(roadmapWithoutLegacyTransfers);
  return roadmapWithIds;
}

/**
 * Loads the roadmap saved to local storage, where "load" is defined as reading, upgrading, then returning.
 * @returns The local roadmap after performing any necessary upgrades
 */
export const loadRoadmap = async (isLoggedIn: boolean) => {
  const accountRoadmap = isLoggedIn ? ((await trpc.roadmaps.get.query()) ?? null) : null;
  const localRoadmap = await upgradeLocalRoadmap();
  return { accountRoadmap, localRoadmap };
};

function saveLocalRoadmap(planners: SavedPlannerData[]) {
  const roadmap: SavedRoadmap = { timestamp: new Date().toISOString(), planners };
  localStorage.setItem('roadmap', JSON.stringify(roadmap));
}

function updateTempIdsInLocalRoadmap(planners: SavedPlannerData[], plannerIdLookup: Record<number, number>) {
  if (Object.keys(plannerIdLookup).length == 0) return;
  const updatedPlanners = planners.map((planner) => {
    if (plannerIdLookup[planner.id]) {
      return { ...planner, id: plannerIdLookup[planner.id] };
    }
    return planner;
  });
  const roadmap: SavedRoadmap = {
    timestamp: JSON.parse(localStorage.getItem('roadmap') ?? '{}')?.timestamp ?? new Date().toISOString(),
    planners: updatedPlanners,
  };
  localStorage.setItem('roadmap', JSON.stringify(roadmap));
}

export const saveRoadmap = async (
  isLoggedIn: boolean,
  lastSavedPlanners: SavedPlannerData[] | null,
  planners: SavedPlannerData[],
) => {
  if (!isLoggedIn) {
    saveLocalRoadmap(planners);
    return { success: true };
  } else {
    const roadmap: SavedRoadmap = {
      timestamp: JSON.parse(localStorage.getItem('roadmap') ?? '{}')?.timestamp ?? new Date().toISOString(),
      planners: planners,
    };
    localStorage.setItem('roadmap', JSON.stringify(roadmap));
  }

  let res = false;
  let plannerIdLookup: Record<number, number> = {};

  const changes = compareRoadmaps(lastSavedPlanners ?? [], planners);
  changes.overwrite = !lastSavedPlanners;

  await trpc.roadmaps.save
    .mutate(changes)
    .then((lookup) => {
      plannerIdLookup = lookup;
      res = true;
      updateTempIdsInLocalRoadmap(planners, plannerIdLookup);
    })
    .catch(() => {
      res = false;
    });

  return { success: res, plannerIdLookup: plannerIdLookup };
};

function normalizePlannerQuarterNames(yearPlans: SavedPlannerYearData[]) {
  return yearPlans.map((year) => ({
    ...year,
    quarters: year.quarters.map((quarter) => ({ ...quarter, name: normalizeQuarterName(quarter.name) })),
  }));
}

export const validatePlanner = (transferNames: string[], currentPlanData: PlannerData) => {
  // store courses that have been taken
  // Transferred courses use ID (no spaces), AP Exams use Catalogue Name
  const taken: Set<string> = new Set(transferNames);
  const invalidCourses: InvalidCourseData[] = [];
  const missing = new Set<string>();
  currentPlanData.forEach((year, yearIndex) => {
    year.quarters.forEach((quarter, quarterIndex) => {
      const taking: Set<string> = new Set(quarter.courses.map((c) => c.department + ' ' + c.courseNumber));
      quarter.courses.forEach((course, courseIndex) => {
        if (!course.prerequisiteTree) return;

        const prerequisite = course.prerequisiteTree;

        const incomplete = validatePrerequisites({ taken, prerequisite, taking });
        if (incomplete.size === 0) return;

        // prerequisite not fulfilled, has some required classes to take
        invalidCourses.push({
          location: { yearIndex, quarterIndex, courseIndex },
          required: Array.from(incomplete),
        });

        incomplete.forEach((course) => missing.add(course));
      });

      // after the quarter is over, add the courses into taken
      taking.forEach((course) => taken.add(course));
    });
  });

  return { missing, invalidCourses };
};

export const getAllCoursesFromPlan = (plan: RoadmapPlan['content']) => {
  return plan.yearPlans.flatMap((yearPlan) =>
    yearPlan.quarters.flatMap((quarter) =>
      quarter.courses.map((course) => course.department + ' ' + course.courseNumber),
    ),
  );
};

interface ValidationInput<PreqrequisiteType> {
  /** The set of courses already taken */
  taken: Set<string>;
  /** The specific prerequisite being checked */
  prerequisite: PreqrequisiteType;
  /** The set of courses being taken in the same quarter */
  taking: Set<string>;
}

const validateCoursePrerequisite = (input: ValidationInput<Prerequisite>) => {
  const { prerequisite, taken, taking } = input;

  //checking prereq type (coures and exam)
  const prereqIsCourse = prerequisite.prereqType === 'course';

  //decide whether coures or exam
  const id = prereqIsCourse ? prerequisite.courseId : prerequisite.examName;

  // check if already done
  const previouslyComplete = taken.has(id);
  if (previouslyComplete) return new Set<string>();

  // checking if the course is a coreq to take in the same quarter
  const isCoreq = prereqIsCourse && prerequisite.coreq;
  if (isCoreq && taking.has(id)) return new Set<string>();

  //the course hasn't been taken
  return new Set([id]);
};

const validateAndPrerequisite = ({ prerequisite, ...input }: ValidationInput<PrerequisiteTree>) => {
  const required: Set<string> = new Set();
  if (!prerequisite.AND) throw new Error('Expected AND prerequisite');

  prerequisite.AND.forEach((nested) => {
    const missing = validatePrerequisites({ prerequisite: nested, ...input });
    missing.forEach((course) => required.add(course));
  });

  return required;
};

const validateOrPrerequisite = ({ prerequisite, ...input }: ValidationInput<PrerequisiteTree>) => {
  const required: Set<string> = new Set();
  if (!prerequisite.OR) throw new Error('Expected OR prerequisite');

  for (const nested of prerequisite.OR) {
    const missing = validatePrerequisites({ prerequisite: nested, ...input });
    if (missing.size === 0) return new Set<string>(); // one is complete; return early
    missing.forEach((course) => required.add(course));
  }

  return required;
};

/**
 * Returns the set of prerequisites of a course that need to be taken but are missing
 * @returns A set of all the prerequisites that are missing
 */
const validatePrerequisites = ({ prerequisite, ...input }: ValidationInput<PrerequisiteNode>): Set<string> => {
  // base case is just a course
  if ('prereqType' in prerequisite) return validateCoursePrerequisite({ prerequisite, ...input });

  if (prerequisite.AND) return validateAndPrerequisite({ prerequisite, ...input });
  if (prerequisite.OR) return validateOrPrerequisite({ prerequisite, ...input });

  // should never reach here
  console.warn('unrecognized prerequisite structure');
  return new Set();
};

export const getMissingPrerequisites = (clearedCourses: Set<string>, prerequisite: PrerequisiteTree) => {
  const input = {
    prerequisite,
    taken: clearedCourses,
    taking: new Set<string>(),
  };

  const missingPrerequisites = Array.from(validatePrerequisites(input));
  return missingPrerequisites.length ? missingPrerequisites : undefined;
};
