import { AppShell } from '$components/AppShell';
import { createHydrationBoundary, prefetchPageData } from '$lib/api/server-prefetch';
import { SeoContent } from '$src/app/[[...slug]]/seo-content';
import { Suspense } from 'react';

export function generateStaticParams() {
    return [{ slug: [] }, { slug: ['added'] }, { slug: ['map'] }];
}

interface PageProps {
    params: Promise<{ slug?: string[] }>;
    searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function PageContent({ searchParams }: { searchParams: Record<string, string | string[] | undefined> }) {
    const { prefetchedSchedule, isAuthenticated, caller } = await prefetchPageData(searchParams);
    const HydrateClient = createHydrationBoundary(caller);

    return (
        <HydrateClient>
            <AppShell prefetchedSchedule={prefetchedSchedule} isAuthenticated={isAuthenticated} />
        </HydrateClient>
    );
}

export default async function Page({ searchParams }: PageProps) {
    const resolvedSearchParams = await searchParams;

    return (
        <>
            <SeoContent />
            <Suspense fallback={null}>
                <PageContent searchParams={resolvedSearchParams} />
            </Suspense>
        </>
    );
}
