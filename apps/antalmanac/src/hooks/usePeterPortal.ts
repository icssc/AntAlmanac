import type { Roadmap } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';

import RightPaneStore from '$components/RightPane/RightPaneStore';
import trpc from '$lib/api/trpc';
import { flattenRoadmapCourses } from '$src/backend/lib/peterportal';
import { useSessionStore } from '$stores/SessionStore';

export function usePeterPortalRoadmaps() {
    const googleId = useSessionStore((s) => s.googleId);
    const setUserTakenCourses = useSessionStore((s) => s.setUserTakenCourses);
    const setFilterTakenCourses = useSessionStore((s) => s.setFilterTakenCourses);

    const [roadmaps, setRoadmaps] = useState<Roadmap[]>([]);
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
                setRoadmaps([]);
                return;
            }
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
        async function flattenCourses() {
            if (!googleId || !selectedRoadmapId) {
                setUserTakenCourses(new Set());
                setFilterTakenCourses(false);
                return;
            }
            if (roadmaps.length === 0) {
                setUserTakenCourses(new Set());
                setFilterTakenCourses(false);
                return;
            }
            const roadmap = roadmaps.find((r) => r.id.toString() === selectedRoadmapId);
            if (!roadmap) return;

            try {
                const flatCourses = flattenRoadmapCourses(roadmap);
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
