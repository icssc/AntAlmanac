import { TRPCClientError } from '@trpc/client';
import { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { cache } from 'react';

import { createServerSideTrpcCaller } from '../../../trpc';
import SharedRoadmap from '../SharedRoadmap';

interface SharePageParams {
    params: Promise<{ shareId: string }>;
}

/** Deduplicated between generateMetadata and the page within a single request */
const getSharedPlanner = cache(async (shareId: string) => {
    const reqHeaders = await headers().then((h) => Object.fromEntries(h.entries()));
    const serverTrpc = createServerSideTrpcCaller(reqHeaders);

    try {
        const data = await serverTrpc.roadmaps.getSharedView.query({ shareId });
        return { status: 'found', data } as const;
    } catch (error) {
        // A malformed share ID (BAD_REQUEST) can't belong to any roadmap, so treat it as not found too
        const code = error instanceof TRPCClientError ? error.data?.code : undefined;
        if (code === 'NOT_FOUND' || code === 'BAD_REQUEST') return { status: 'not-found' } as const;
        return { status: 'error' } as const;
    }
});

export async function generateMetadata({ params }: SharePageParams): Promise<Metadata> {
    const result = await getSharedPlanner((await params).shareId);
    if (result.status !== 'found') return { title: 'Shared Roadmap | AntAlmanac Planner' };

    return {
        title: `${result.data.planner.name} | AntAlmanac Planner`,
        description: `A 4-year plan shared from AntAlmanac Planner.`,
    };
}

const Page = async ({ params }: SharePageParams) => {
    const result = await getSharedPlanner((await params).shareId);
    if (result.status === 'not-found') notFound();

    return <SharedRoadmap data={result.status === 'found' ? result.data : null} />;
};
export default Page;
