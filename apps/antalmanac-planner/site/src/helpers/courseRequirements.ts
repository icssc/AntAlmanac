import {
    GEName,
    GETitle,
    MajorProgram,
    MajorSpecialization,
    MinorProgram,
    ProgramRequirement,
    TransferredGE,
} from '@peterportal/types';

import { useTransferredCredits, TransferredCourseWithType } from '../hooks/transferCredits';
import { useAppSelector } from '../store/hooks';
import trpc from '../trpc';
import { CourseGQLData } from '../types/types';

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
    repeatabilityTimes: null,
    repeatabilityType: null,
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

export const formatCatalogYear = (year: string) => `${year.slice(0, 4)}-${year.slice(4)}`;

export function getCatalogYearDefaults() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    const startYear = month >= 4 ? year : year - 1; // catalog year increases when SOC is released for the next fall quarter during spring

    return {
        defaultCatalogYear: `${startYear}${startYear + 1}`,
        catalogYearOptions: Array.from({ length: 5 }, (_, i) => {
            const optionStartYear = startYear - i;
            const value = `${optionStartYear}${optionStartYear + 1}`;
            return { value, label: formatCatalogYear(value) };
        }),
    };
}

/** A RegEx for GE labels in Degree Requirements */
const GE_LABEL_REGEX = /^\d courses? category ([iv]+[ab]?)$|^([iv]+[ab]?)\. (\w.*)/i;

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
        if (r.requirementType !== 'Course' || r.courses.length !== 1 || r.courseCount !== 1) {
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
    preserveOuterLabels = true
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
    skipCollapseSingletons?: boolean
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
        /** Eligible enrollment count; omitted legacy entries represent one enrollment. */
        count?: number;
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

export interface CompletionCheckOptions {
    completedMarkers?: Record<string, boolean>;
    geCredits?: TransferredGE[];
}

function checkCourseListCompletion(
    completed: CompletedCourseSet,
    requirement: ProgramRequirement<'Course'>
): CompletionStatus {
    const required = requirement.courseCount;
    let completedCount = 0;
    if (required === requirement.courses.length) {
        // Each listed mandatory course needs its own eligible enrollment. Repeating A cannot replace B.
        const remaining = new Map(Object.entries(completed).map(([id, course]) => [id, course.count ?? 1]));
        for (const id of requirement.courses) {
            const count = remaining.get(id) ?? 0;
            if (count > 0) {
                completedCount++;
                remaining.set(id, count - 1);
            }
        }
    } else {
        completedCount = [...new Set(requirement.courses)].reduce(
            (sum, id) => sum + (completed[id] ? (completed[id].count ?? 1) : 0),
            0
        );
    }
    return { required, completed: completedCount, done: completedCount >= required };
}

export function checkCompletion(
    completed: CompletedCourseSet,
    requirement: ProgramRequirement,
    options: CompletionCheckOptions = {}
): CompletionStatus {
    if (requirement.requirementType === 'Marker')
        return {
            required: 0,
            completed: 0,
            done: !!options.completedMarkers?.[requirement.label],
        };
    if (requirement.requirementType === 'Group') {
        const count = requirement.requirements.filter(
            (child) => checkCompletion(completed, child, options).done
        ).length;
        return {
            required: requirement.requirementCount,
            completed: count,
            done: count >= requirement.requirementCount,
        };
    }
    const ge = options.geCredits?.find((credit) => credit.geName === getMatchingGECategory(requirement.label.trim()));
    if (requirement.requirementType === 'Course') {
        const result = checkCourseListCompletion(completed, requirement);
        const count = result.completed + (ge?.numberOfCourses ?? 0);
        return { required: result.required, completed: count, done: count >= result.required };
    }
    const required = requirement.unitCount;
    const units =
        [...new Set(requirement.courses)].reduce((sum, id) => sum + (completed[id]?.units ?? 0), 0) + (ge?.units ?? 0);
    return { required, completed: units, done: units >= required };
}

export function useCompletionCheck(completed: CompletedCourseSet, requirement: ProgramRequirement): CompletionStatus {
    const completedMarkers = useAppSelector((state) => state.courseRequirements.completedMarkers);
    const geCredits = useTransferredCredits().ge;
    return checkCompletion(completed, requirement, { completedMarkers, geCredits });
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

export async function loadOverriddenRequirements(plannerId: number, isLoggedIn: boolean): Promise<string[]> {
    if (isLoggedIn) {
        const response = await trpc.override.getOverrides.query({ plannerId: plannerId });
        return response;
    } else {
        let overriddenRequirements: string[] = [];
        try {
            overriddenRequirements = JSON.parse(
                localStorage.getItem(`roadmap__savedRequirements__${plannerId}`) || '[]'
            );
        } catch {
            /* ignore */
        }
        return overriddenRequirements;
    }
}

export async function saveOverriddenRequirement(
    plannerId: number,
    requirement: string,
    override: boolean,
    isLoggedIn: boolean
): Promise<void> {
    if (isLoggedIn) {
        const operationName = override ? 'addOverride' : 'deleteOverride';
        const operation = trpc.override[operationName];
        await operation.mutate({ plannerId: plannerId, requirement: requirement });
    } else {
        const overriddenRequirements = new Set(await loadOverriddenRequirements(plannerId, false));
        overriddenRequirements[override ? 'add' : 'delete'](requirement);
        localStorage.setItem(`roadmap__savedRequirements__${plannerId}`, JSON.stringify([...overriddenRequirements]));
    }
}
