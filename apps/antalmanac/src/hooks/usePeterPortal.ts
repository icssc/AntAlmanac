import { useEffect, useState } from 'react';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import trpc from '$lib/api/trpc';
import { type PeterPortalRoadmap } from '$src/backend/lib/peterportal';
import { useSessionStore } from '$stores/SessionStore';

export function usePeterPortalRoadmaps() {
    const googleId = useSessionStore((s) => s.googleId);
    const setUserTakenCourses = useSessionStore((s) => s.setUserTakenCourses);
    const setFilterTakenCourses = useSessionStore((s) => s.setFilterTakenCourses);

    const [roadmaps, setRoadmaps] = useState<PeterPortalRoadmap[] | never[]>([]);
    const selectedRoadmapId = RightPaneStore.getFormData().excludeRoadmapCourses;

    useEffect(() => {
        const active = true;
        async function loadRoadmaps() {
            if (!googleId) return;
            try {
                const data = await trpc.roadmap.fetchUserRoadmapsPeterPortal.query({
                    userId: googleId,
                });
                if (active) setRoadmaps(data ?? []);
            } catch (e) {
                console.error('Failed to fetch PeterPortal roadmaps:', e);
            }
        }
        loadRoadmaps();
    }, [googleId]);

    useEffect(() => {
        async function flattenCourses() {
            if (!selectedRoadmapId) {
                setUserTakenCourses(new Set());
                setFilterTakenCourses(false);
                return;
            }
            const roadmap = roadmaps.find((r) => r.id.toString() === selectedRoadmapId);
            if (!roadmap) return;

            try {
                const flatCourses = await trpc.roadmap.flattenRoadmapCourses.query({ roadmap });
                const courseSet = new Set<string>(flatCourses);
                setUserTakenCourses(courseSet);
                setFilterTakenCourses(true);
            } catch (e) {
                console.error('Failed to flatten roadmap courses:', e);
            }
        }
        flattenCourses();
    }, [roadmaps, selectedRoadmapId, setUserTakenCourses, setFilterTakenCourses]);

    return {
        roadmaps,
    };
}
