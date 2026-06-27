import { Header } from '$components/Header/Header';
import { UserAgentProvider } from '$providers/UserAgentProvider';
import Client from '$src/app/(main)/client';
import { SeoContent } from '$src/app/(main)/seo-content';
import { headers } from 'next/headers';

export default async function Layout({ children }: { children: React.ReactNode }) {
    const userAgent = (await headers()).get('user-agent') ?? '';

    return (
        <>
            <SeoContent />
            <UserAgentProvider userAgent={userAgent}>
                <Header />
                <Client />
            </UserAgentProvider>
            {children}
        </>
    );
}
