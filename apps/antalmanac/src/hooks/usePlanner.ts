import RightPaneStore from '$components/RightPane/RightPaneStore';
import trpc from '$lib/api/trpc';
import { getCurrentTerm } from '$lib/termData';
import { useSessionStore } from '$stores/SessionStore';
import type { Roadmap } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';

const QUARTER_ORDER: Record<string, number> = {
    Winter: 0,
    Spring: 1,
    Summer: 2,
    Fall: 3,
};

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
                (quarter.year === current.year && QUARTER_ORDER[quarter.quarter] < QUARTER_ORDER[current.quarter])
            ) {
                q.courses.forEach((c) => courses.add(c));
            }
        }
    }
    return Array.from(courses);
}

export function usePlannerRoadmaps() {
    const googleId = useSessionStore((s) => s.googleId);
    const setUserTakenCourses = useSessionStore((s) => s.setUserTakenCourses);
    const setFilterTakenCourses = useSessionStore((s) => s.setFilterTakenCourses);
    const roadmaps = useSessionStore((s) => s.plannerRoadmaps);
    const setPlannerRoadmaps = useSessionStore((s) => s.setPlannerRoadmaps);
    const [selectedRoadmapId, setSelectedRoadmapId] = useState(
        () => RightPaneStore.getFormData().excludeRoadmapCourses
    );

    useEffect(() => {
        const handleFormDataChange = () => {
            setSelectedRoadmapId(RightPaneStore.getFormData().excludeRoadmapCourses);
        };

        RightPaneStore.on('formDataChange', handleFormDataChange);
        return () => {
            RightPaneStore.removeListener('formDataChange', handleFormDataChange);
        };
    }, []);

    useEffect(() => {
        let active = true;
        async function loadRoadmaps() {
            if (!googleId) {
                setPlannerRoadmaps([]);
                return;
            }
            try {
                const data = await trpc.roadmap.fetchUserPlannerRoadmaps.query({
                    userId: googleId,
                });
                if (active) setPlannerRoadmaps(data ?? []);
            } catch (e) {
                console.error('Failed to fetch Planner roadmaps:', e);
            }
        }
        loadRoadmaps();
        return () => {
            active = false;
        };
    }, [googleId, setPlannerRoadmaps]);

    useEffect(() => {
        function flattenCourses() {
            if (!googleId || !selectedRoadmapId || roadmaps.length === 0) {
                setUserTakenCourses(new Set());
                setFilterTakenCourses(false);
                return;
            }

            const roadmap = roadmaps.find((r) => r.id.toString() === selectedRoadmapId);
            if (!roadmap) {
                setUserTakenCourses(new Set());
                setFilterTakenCourses(false);
                return;
            }

            try {
                const flatCourses = getTakenRoadmapCourses(roadmap);
                const courseSet = new Set<string>(flatCourses);
                setUserTakenCourses(courseSet);
                setFilterTakenCourses(true);
            } catch (e) {
                console.error('Failed to flatten roadmap courses:', e);
            }
        }
        flattenCourses();
    }, [googleId, roadmaps, selectedRoadmapId, setFilterTakenCourses, setUserTakenCourses]);

    return {
        roadmaps,
    };
}
