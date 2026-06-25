import { Header } from '$components/Header/Header';
import { ClientShell } from '$src/app/(main)/client-shell';
import { SeoContent } from '$src/app/(main)/seo-content';
import { Suspense } from 'react';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SeoContent />
            <Suspense>
                <Header />
            </Suspense>
            <ClientShell />
            {children}
        </>
    );
}
