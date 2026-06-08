import nextDynamic from 'next/dynamic';

const MainLayoutClient = nextDynamic(
    () => import('$src/app/(main)/main-layout-client').then((module) => ({ default: module.MainLayoutClient })),
    { ssr: false }
);

export const dynamic = 'force-dynamic';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <MainLayoutClient>{children}</MainLayoutClient>;
}
