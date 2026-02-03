import type { PeterPortalAPIResponse, Roadmap } from '@packages/antalmanac-types';
import { z } from 'zod';

import { ppEnvSchema } from '../env';

export type { Quarter, RoadmapContent, Roadmap, PeterPortalAPIResponse } from '@packages/antalmanac-types';

export const PETERPORTAL_API_URL = 'https://antalmanac.com/planner/api/trpc/external.roadmaps.getByGoogleID';

export function getCurrentTerm(): { year: number; quarter: string } {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth() + 1;
    const quarter = month <= 3 ? 'Winter' : month <= 6 ? 'Spring' : month <= 9 ? 'Summer' : 'Fall';
    return { year, quarter };
}

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

export async function fetchUserRoadmapsPeterPortal(userId: string) {
    // maybe add a return promise
    const env = ppEnvSchema.parse(process.env);
    const apiKey = env.PETERPORTAL_CLIENT_API_KEY;

    const searchParams = new URLSearchParams();
    searchParams.set('input', JSON.stringify({ googleUserId: userId }));
    const url = `${PETERPORTAL_API_URL}?${searchParams}`;

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
        const data: PeterPortalAPIResponse = await response.json();
        return data.result?.data ?? [];
    } catch (e) {
        console.error('PeterPortal fetch failed:', e);
        return [];
    }
}

export function flattenRoadmapCourses(roadmap: Roadmap): string[] {
    const courses: Set<string> = new Set();

    for (const year of roadmap.content ?? []) {
        for (const q of year.quarters ?? []) {
            q.courses?.forEach((c) => courses.add(c));
        }
    }
    return Array.from(courses);
}
