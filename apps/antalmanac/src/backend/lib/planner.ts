import { plannerEnvSchema } from '$src/backend/env';
import type { Roadmap } from '@packages/antalmanac-types';
import { headers } from 'next/headers';
import { z } from 'zod';

export type { PlannerAPIResponse, Quarter, Roadmap, RoadmapContent } from '@packages/antalmanac-types';

export const PLANNER_API_URL_PATH = '/planner/api/trpc/external.roadmaps.getByGoogleID';

const courseSchema = z.object({
    courseId: z.string(),
    userChosenUnits: z.number().optional(),
});

export const quarterSchema = z.object({
    name: z.string(),
    courses: z.array(courseSchema),
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

function getPlannerApiDomain(domain: string) {
    if (domain.startsWith('staging-shared')) {
        return domain;
    } else {
        return 'antalmanac.com';
    }
}

export async function fetchUserPlannerRoadmaps(googleUserId: string): Promise<Roadmap[]> {
    const env = plannerEnvSchema.parse(process.env);
    const apiKey = env.PLANNER_CLIENT_API_KEY;

    const requestHeaders = await headers();
    const domain = requestHeaders.get('host') || 'antalmanac.com';
    const apiDomain = getPlannerApiDomain(domain);

    const searchParams = new URLSearchParams();
    searchParams.set('input', JSON.stringify({ googleUserId: googleUserId }));
    const url = `https://${apiDomain}${PLANNER_API_URL_PATH}?${searchParams}`;

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
        const validRoadmaps = z.array(roadmapSchema).parse(data.result.data);

        return validRoadmaps;
    } catch (e) {
        console.error('Planner fetch failed:', e);
        return [];
    }
}
