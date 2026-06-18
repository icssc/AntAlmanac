import { Header } from '$components/Header/Header';
import { getIsMobileFromHeaders } from '$lib/getIsMobileFromHeaders';
import { ClientShell } from '$src/app/(main)/client-shell';
import { SeoContent } from '$src/app/(main)/seo-content';
import { headers } from 'next/headers';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const requestHeaders = await headers();
    const initialIsMobile = getIsMobileFromHeaders(requestHeaders);

    return (
        <>
            <SeoContent />
            <Header initialIsMobile={initialIsMobile} />
            <ClientShell />
            {children}
        </>
    );
}
