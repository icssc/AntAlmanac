import 'server-only';
import { createQueryClient } from '$lib/api/query-client';
import { createServerContext } from '$lib/api/server-trpc';
import { prefetchCourseSearch, type PrefetchedSchedule } from '$lib/courseSearchQuery.server';
import appRouter, { type AppRouter } from '$src/backend/routers';
import { createHydrationHelpers } from '@trpc/react-query/rsc';
import { cache } from 'react';

export const getQueryClient = cache(createQueryClient);

export async function prefetchPageData(searchParams: Record<string, string | string[] | undefined>) {
    const queryClient = getQueryClient();
    const ctx = await createServerContext();
    const caller = appRouter.createCaller(ctx);
    const { trpc } = createHydrationHelpers<AppRouter>(caller, getQueryClient);

    let prefetchedSchedule: PrefetchedSchedule = null;

    if (ctx.userId && ctx.sessionToken) {
        try {
            prefetchedSchedule = await trpc.schedule.get();
        } catch (error) {
            console.error('Failed to prefetch schedule', error);
        }
    }

    await prefetchCourseSearch(queryClient, caller, searchParams);

    return {
        prefetchedSchedule,
        isAuthenticated: Boolean(ctx.userId && ctx.sessionToken),
        caller,
    };
}

export function createHydrationBoundary(caller: ReturnType<typeof appRouter.createCaller>) {
    return createHydrationHelpers<AppRouter>(caller, getQueryClient).HydrateClient;
}
