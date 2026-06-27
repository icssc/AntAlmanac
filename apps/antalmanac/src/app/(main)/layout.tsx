import { Header } from '$components/Header/Header';
import { UserAgentProvider } from '$providers/UserAgentProvider';
import Client from '$src/app/(main)/client';
import { SeoContent } from '$src/app/(main)/seo-content';
import { headers } from 'next/headers';
import { userAgent } from 'next/server';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const parsedUserAgent = userAgent({ headers: await headers() });

    return (
        <>
            <SeoContent />
            <UserAgentProvider userAgent={parsedUserAgent}>
                <Header />
                <Client />
            </UserAgentProvider>
            {children}
        </>
    );
}
