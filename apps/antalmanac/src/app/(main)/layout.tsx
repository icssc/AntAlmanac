import { Header } from '$components/Header/Header';
import { ClientShell } from '$src/app/(main)/client-shell';
import { SeoContent } from '$src/app/(main)/seo-content';

export default function Layout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <SeoContent />
            <Header />
            <ClientShell />
            {children}
        </>
    );
}
