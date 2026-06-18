import { DynamicClient } from '$src/app/(main)/client';
import { SeoContent } from '$src/app/(main)/seo-content';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SeoContent />
            <DynamicClient />
            {children}
        </>
    );
}
