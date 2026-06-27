import { Header } from '$components/Header/Header';
import Client from '$src/app/(main)/client';
import { SeoContent } from '$src/app/(main)/seo-content';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SeoContent />
            <Header />
            <Client />
            {children}
        </>
    );
}
