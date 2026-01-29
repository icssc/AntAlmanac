import { useEffect, useState } from 'react';

import { useSessionStore } from '$stores/SessionStore';
import trpc from '$lib/api/trpc';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import type { Roadmap } from '@packages/antalmanac-types';

export function usePeterPortalRoadmaps() {
    const googleId = useSessionStore((s) => s.googleId);
    const setUserTakenCourses = useSessionStore((s) => s.setUserTakenCourses);
    const setFilterTakenCourses = useSessionStore((s) => s.setFilterTakenCourses);

    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
    const selectedRoadmapId = RightPaneStore.getFormData().excludeRoadmapCourses;

    useEffect(() => {
        let active = true;
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
        return () => {
            active = false;
        };
    }, [googleId]);

    useEffect(() => {
        async function flattenCourses () {
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
    }), [roadmaps, selectedRoadmapId]

    return {
        roadmaps,
    };
}