import { ClientOnly } from '$src/app/[[...slug]]/client';
import { SeoContent } from '$src/app/[[...slug]]/seo-content';
import { notFound } from 'next/navigation';

/** Multi-segment paths still handled by the client SPA (react-router-dom). */
const SPA_MULTI_SEGMENT_PATHS = new Set(['auth/native']);

export function generateStaticParams() {
    return [{ slug: [] }, { slug: ['added'] }, { slug: ['map'] }];
}

type PageProps = {
    params: Promise<{ slug?: string[] }>;
};

export default async function Page({ params }: PageProps) {
    const { slug = [] } = await params;

    if (slug.length >= 2 && !SPA_MULTI_SEGMENT_PATHS.has(slug.join('/'))) {
        notFound();
    }

    return (
        <>
            <SeoContent />
            <ClientOnly />
        </>
    );
}
