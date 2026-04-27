import { plannerEnvSchema } from '$src/backend/env';
import type { Roadmap } from '@packages/antalmanac-types';
import { z } from 'zod';

export type { PlannerAPIResponse, Quarter, Roadmap, RoadmapContent } from '@packages/antalmanac-types';

export const PLANNER_API_URL = 'https://antalmanac.com/planner/api/trpc/external.roadmaps.getByGoogleID';

export const quarterSchema = z.object({
    name: z.string(),
    courses: z.array(z.string()),
});

export const roadmapContentSchema = z.object({
    name: z.string(),
    startYear: z.number(),
    quarters: z.array(quarterSchema),
});

export const roadmapSchema = z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    chc: z.string().nullable().optional(),
    content: z.array(roadmapContentSchema),
});

export async function fetchUserPlannerRoadmaps(googleUserId: string): Promise<Roadmap[]> {
    const env = plannerEnvSchema.parse(process.env);
    const apiKey = env.PLANNER_CLIENT_API_KEY;

    const searchParams = new URLSearchParams();
    searchParams.set('input', JSON.stringify({ googleUserId: googleUserId }));
    const url = `${PLANNER_API_URL}?${searchParams}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch: ${response.statusText}`);
        }
        const data = await response.json();
        const validRoadmaps = z.array(roadmapSchema).parse(data.result?.data ?? []);

        return validRoadmaps;
    } catch (e) {
        console.error('Planner fetch failed:', e);
        return [];
    }
}
