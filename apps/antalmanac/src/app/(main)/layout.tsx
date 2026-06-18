import { Header } from '$components/Header/Header';
import { isMobileUserAgent } from '$lib/isMobileUserAgent';
import { ClientShell } from '$src/app/(main)/client-shell';
import { SeoContent } from '$src/app/(main)/seo-content';
import { headers } from 'next/headers';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const userAgent = (await headers()).get('user-agent') ?? '';
    const initialIsMobile = isMobileUserAgent(userAgent);

    return (
        <>
            <SeoContent />
            <Header initialIsMobile={initialIsMobile} />
            <ClientShell />
            {children}
        </>
    );
}
