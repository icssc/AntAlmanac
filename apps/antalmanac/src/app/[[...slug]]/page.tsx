import { ClientOnly } from '$src/app/[[...slug]]/client';
import { SeoContent } from '$src/app/[[...slug]]/seo-content';

export function generateStaticParams() {
    return [{ slug: [] }, { slug: ['added'] }, { slug: ['map'] }];
}

export default function Page() {
    return (
        <>
            <SeoContent />
            <ClientOnly />
        </>
    );
}
