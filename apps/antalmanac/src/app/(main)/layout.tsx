import { Header } from '$components/Header/Header';
import { MobileUserAgentProvider } from '$components/MobileUserAgentProvider';
import { isMobileUserAgent } from '$lib/isMobileUserAgent';
import Client from '$src/app/(main)/client';
import { SeoContent } from '$src/app/(main)/seo-content';
import { headers } from 'next/headers';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const isMobile = isMobileUserAgent(await headers());

    return (
        <>
            <SeoContent />
            <Header />
            <MobileUserAgentProvider isMobile={isMobile}>
                <Client />
            </MobileUserAgentProvider>
            {children}
        </>
    );
}
