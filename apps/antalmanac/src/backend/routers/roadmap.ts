import { plannerEnvSchema } from '$src/backend/env';
import { protectedProcedure, router } from '$src/backend/trpc';
import type { Roadmap } from '@packages/antalmanac-types';
import { headers } from 'next/headers';
import { z } from 'zod';

const PLANNER_API_URL_PATH = '/planner/api/trpc/external.roadmaps.getByEmail';

const roadmapSchema = z.object({
    id: z.union([z.string(), z.number()]),
    name: z.string(),
    chc: z.string().nullable().optional(),
    content: z.array(
        z.object({
            name: z.string(),
            startYear: z.number(),
            quarters: z.array(
                z.object({
                    name: z.string(),
                    courses: z.array(
                        z.object({
                            courseId: z.string(),
                            userChosenUnits: z.number().optional(),
                        })
                    ),
                })
            ),
        })
    ),
});

function getPlannerApiDomain(domain: string) {
    return domain === 'staging-shared.antalmanac.com' ? domain : 'antalmanac.com';
}

const roadmapRouter = router({
    fetchUserPlannerRoadmaps: protectedProcedure.query(async ({ ctx }): Promise<Roadmap[]> => {
        if (!ctx.userEmail) {
            return [];
        }

        const { PLANNER_CLIENT_API_KEY: apiKey } = plannerEnvSchema.parse(process.env);
        const domain = (await headers()).get('host') ?? 'antalmanac.com';
        const url = `https://${getPlannerApiDomain(domain)}${PLANNER_API_URL_PATH}?${new URLSearchParams({ input: JSON.stringify({ email: ctx.userEmail }) })}`;

        try {
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }

            const data = await response.json();
            return z.array(roadmapSchema).parse(data.result.data);
        } catch (e) {
            console.error('Planner fetch failed:', e);
            return [];
        }
    }),
});

export default roadmapRouter;
