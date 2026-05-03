import trpc from '$lib/api/trpc';
import { QUARTER_ORDER_IN_YEAR } from '$lib/helpers';
import { getCurrentTerm } from '$lib/termData';
import { useSessionStore } from '$stores/SessionStore';
import type { Roadmap } from '@packages/antalmanac-types';
import { create } from 'zustand';

interface PlannerStore {
    filterTakenCourses: boolean;
    userTakenCourses: Set<string>;
    plannerRoadmaps: Roadmap[];
    isPlannerLoading: boolean;

    loadPlannerRoadmaps: (googleId: string) => Promise<void>;
    updateTakenCourses: (roadmapId: string) => void;
}

function roadmapQuarterToYearAndQuarter(startYear: number, quarterName: string): { year: number; quarter: string } {
    const q = quarterName.trim().toLowerCase();
    const isFall = q === 'fall';
    const year = isFall ? startYear : startYear + 1;

    const quarterMap: Record<string, string> = {
        fall: 'Fall',
        winter: 'Winter',
        spring: 'Spring',
        summer1: 'Summer',
        summer2: 'Summer',
        summer10wk: 'Summer',
    };

    const quarter = quarterMap[q];
    return { year, quarter };
}

function getTakenRoadmapCourses(roadmap: Roadmap): string[] {
    const current = getCurrentTerm();
    const courses = new Set<string>();
    for (const year of roadmap.content ?? []) {
        for (const q of year.quarters ?? []) {
            const quarter = roadmapQuarterToYearAndQuarter(year.startYear, q.name);
            if (
                quarter.year < current.year ||
                (quarter.year === current.year &&
                    QUARTER_ORDER_IN_YEAR[quarter.quarter] < QUARTER_ORDER_IN_YEAR[current.quarter])
            ) {
                q.courses.forEach((c) => courses.add(c.courseId));
            }
        }
    }
    return Array.from(courses);
}

export const usePlannerStore = create<PlannerStore>((set, get) => {
    return {
        filterTakenCourses: false,
        userTakenCourses: new Set(),
        plannerRoadmaps: [],
        isPlannerLoading: false,

        loadPlannerRoadmaps: async (googleId) => {
            if (!googleId) {
                set({ plannerRoadmaps: [] });
                return;
            }
            set({ isPlannerLoading: true });
            try {
                const data = await trpc.roadmap.fetchUserPlannerRoadmaps.query();
                set({ plannerRoadmaps: data ?? [] });
            } catch (e) {
                console.error('Failed to fetch Planner roadmaps:', e);
            }
            set({ isPlannerLoading: false });
        },

        updateTakenCourses: (selectedRoadmapId) => {
            const googleId = useSessionStore.getState().googleId;
            const roadmaps = get().plannerRoadmaps;
            if (!googleId || !selectedRoadmapId || roadmaps.length === 0) {
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
                const courseSet = new Set<string>(flatCourses);
                set({ userTakenCourses: courseSet, filterTakenCourses: true });
            } catch (e) {
                console.error('Failed to flatten roadmap courses:', e);
            }
        },
    };
});
