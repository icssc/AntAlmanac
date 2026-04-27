import trpc from '$lib/api/trpc';
import { getCurrentTerm } from '$lib/termData';
import type { Syllabus, SyllabiQuarter } from '@packages/antalmanac-types';

/**
 * The API's `quarter` enum uses `Summer1` / `Summer10wk` / `Summer2`, whereas
 * AntAlmanac's `termData` short names look like `"2025 Summer1"`. Parse the
 * short name from `RightPaneStore.formData.term` into a pair that matches the
 * API shape so we can compare directly.
 */
export interface CurrentTerm {
    year: string;
    quarter: SyllabiQuarter;
}

const IN_FLIGHT: Map<string, Promise<Syllabus[]>> = new Map();
const CACHE: Map<string, Syllabus[]> = new Map();

export function buildCourseId(deptCode: string, courseNumber: string): string {
    return `${deptCode.replaceAll(' ', '')}${courseNumber}`;
}

/**
 * De-duplicated, process-wide cache keyed by `courseId`. The course-level
 * popover and the per-section column cell share results.
 */
export async function getSyllabi(courseId: string): Promise<Syllabus[]> {
    const cached = CACHE.get(courseId);
    if (cached) {
        return cached;
    }

    const existing = IN_FLIGHT.get(courseId);
    if (existing) {
        return existing;
    }

    const request = trpc.syllabi.get
        .query({ courseId })
        .then((data) => {
            CACHE.set(courseId, data);
            return data;
        })
        .finally(() => {
            IN_FLIGHT.delete(courseId);
        });

    IN_FLIGHT.set(courseId, request);
    return request;
}

/**
 * `"2025 Fall"` / `"2025 Summer1"` → `{ year: "2025", quarter: "Fall" }`.
 * Falls back to today's calendar term if the short name cannot be parsed.
 */
export function parseTermShortName(shortName: string | undefined): CurrentTerm {
    if (shortName) {
        const [year, quarter] = shortName.split(' ');
        if (year && quarter && isSyllabiQuarter(quarter)) {
            return { year, quarter };
        }
    }

    const fallback = getCurrentTerm();
    const quarter: SyllabiQuarter = isSyllabiQuarter(fallback.quarter)
        ? fallback.quarter
        : // `getCurrentTerm` produces plain `"Summer"`; map to the long session.
          fallback.quarter === 'Summer'
          ? 'Summer10wk'
          : 'Fall';
    return { year: String(fallback.year), quarter };
}

function isSyllabiQuarter(value: string): value is SyllabiQuarter {
    return (
        value === 'Fall' ||
        value === 'Winter' ||
        value === 'Spring' ||
        value === 'Summer1' ||
        value === 'Summer10wk' ||
        value === 'Summer2'
    );
}

export function isCurrentOffering(s: Syllabus, current: CurrentTerm): boolean {
    return s.year === current.year && s.quarter === current.quarter;
}

const QUARTER_DISPLAY: Record<SyllabiQuarter, string> = {
    Fall: 'Fall',
    Winter: 'Winter',
    Spring: 'Spring',
    Summer1: 'Summer Session 1',
    Summer10wk: '10-wk Summer',
    Summer2: 'Summer Session 2',
};

export function formatTermLabel(year: string, quarter: SyllabiQuarter): string {
    return `${QUARTER_DISPLAY[quarter]} ${year}`;
}

const QUARTER_ORDER: Record<SyllabiQuarter, number> = {
    Fall: 5,
    Summer2: 4,
    Summer10wk: 3,
    Summer1: 2,
    Spring: 1,
    Winter: 0,
};

function compareTermsDesc(a: Syllabus, b: Syllabus): number {
    if (a.year !== b.year) {
        return Number.parseInt(b.year, 10) - Number.parseInt(a.year, 10);
    }
    return QUARTER_ORDER[b.quarter] - QUARTER_ORDER[a.quarter];
}

/**
 * Group syllabi by `"<Quarter> <Year>"`, most recent first. Within a group,
 * order matches the API (already newest-first); same-term rows represent
 * distinct sections taught by different professors.
 */
export function groupByTerm(syllabi: Syllabus[]): Array<{ label: string; items: Syllabus[] }> {
    const groups = new Map<string, Syllabus[]>();
    for (const s of [...syllabi].sort(compareTermsDesc)) {
        const label = formatTermLabel(s.year, s.quarter);
        const bucket = groups.get(label);
        if (bucket) {
            bucket.push(s);
        } else {
            groups.set(label, [s]);
        }
    }
    return [...groups.entries()].map(([label, items]) => ({ label, items }));
}

export interface ProfessorGroup {
    instructor: string;
    items: Syllabus[];
    teachingCurrentTerm: boolean;
}

/**
 * Group syllabi by instructor. A syllabus with N instructors contributes to N
 * groups. Professors who appear in the current term float to the front; within
 * each group items are sorted newest-first.
 */
export function groupByProfessor(syllabi: Syllabus[], current: CurrentTerm): ProfessorGroup[] {
    const groups = new Map<string, Syllabus[]>();
    for (const s of syllabi) {
        for (const name of s.instructorNames) {
            const bucket = groups.get(name);
            if (bucket) {
                bucket.push(s);
            } else {
                groups.set(name, [s]);
            }
        }
    }

    const result: ProfessorGroup[] = [...groups.entries()].map(([instructor, items]) => {
        const sorted = [...items].sort(compareTermsDesc);
        const teachingCurrentTerm = sorted.some((s) => isCurrentOffering(s, current));
        return { instructor, items: sorted, teachingCurrentTerm };
    });

    return result.sort((a, b) => {
        if (a.teachingCurrentTerm !== b.teachingCurrentTerm) {
            return a.teachingCurrentTerm ? -1 : 1;
        }
        return a.instructor.localeCompare(b.instructor);
    });
}

export function pickCurrentTermOfferings(syllabi: Syllabus[], current: CurrentTerm): Syllabus[] {
    return syllabi.filter((s) => isCurrentOffering(s, current));
}
