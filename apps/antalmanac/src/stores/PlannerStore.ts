import trpc from '$lib/api/trpc';
import { getDefaultTerm, getTermByYearAndQuarter, parseQuarter, termData } from '$lib/term';
import { openSnackbar } from '$stores/SnackbarStore';
import type { AATerm, Roadmap } from '@packages/antalmanac-types';
import { create } from 'zustand';

interface PlannerStore {
    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;
    plannerRoadmaps: Roadmap[];
    isPlannerLoading: boolean;

    loadPlannerRoadmaps: () => Promise<void>;
    updateTakenCourses: (selectedRoadmapId: string) => void;
}

function roadmapQuarterToTerm(startYear: number, quarterName: string): AATerm | undefined {
    const quarter = parseQuarter(quarterName);
    if (!quarter) {
        return undefined;
    }

    const year = quarter === 'Fall' ? startYear : startYear + 1;
    return getTermByYearAndQuarter(year.toString(), quarter);
}

function getTakenRoadmapCourses(roadmap: Roadmap): Set<string> {
    const current = getDefaultTerm();
    const currentTermIndex = termData.findIndex((term) => term.shortName === current.shortName);
    const courses = new Set<string>();
    for (const year of roadmap.content ?? []) {
        for (const q of year.quarters ?? []) {
            const term = roadmapQuarterToTerm(year.startYear, q.name);
            if (!term) {
                continue;
            }
            if (termData.findIndex((t) => t.shortName === term.shortName) > currentTermIndex) {
                q.courses.forEach((c) => courses.add(c.courseId));
            }
        }
    }
    return courses;
}

export const usePlannerStore = create<PlannerStore>((set, get) => {
    return {
        filterTakenCourses: false,
        userTakenCourses: new Set(),
        plannerRoadmaps: [],
        isPlannerLoading: false,

        loadPlannerRoadmaps: async () => {
            set({ isPlannerLoading: true });
            try {
                const data = await trpc.roadmap.fetchUserPlannerRoadmaps.query();
                set({ plannerRoadmaps: data ?? [] });
            } catch (e) {
                console.error('Failed to fetch Planner roadmaps:', e);
                openSnackbar('error', 'Failed to fetch Planner roadmaps');
                set({ plannerRoadmaps: [] });
            }
            set({ isPlannerLoading: false });
        },

        updateTakenCourses: (selectedRoadmapId) => {
            const roadmaps = get().plannerRoadmaps;
            if (!selectedRoadmapId || roadmaps.length === 0) {
                set({ userTakenCourses: new Set(), filterTakenCourses: false });
                return;
            }

            const roadmap = roadmaps.find((r) => r.id.toString() === selectedRoadmapId);
            if (!roadmap) {
                set({ userTakenCourses: new Set(), filterTakenCourses: false });
                return;
            }

            try {
                const flatCourses = getTakenRoadmapCourses(roadmap);
                set({ userTakenCourses: flatCourses, filterTakenCourses: true });
            } catch (e) {
                console.error('Failed to flatten roadmap courses:', e);
                set({ userTakenCourses: new Set(), filterTakenCourses: false });
            }
        },
    };
});
