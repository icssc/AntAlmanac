'use client';

import dynamic from 'next/dynamic';

const MainLayoutClient = dynamic(
    () => import('$src/app/(main)/main-layout-client').then((module) => ({ default: module.MainLayoutClient })),
    { ssr: false }
);

export function MainLayoutDynamic({ children }: { children: React.ReactNode }) {
    return <MainLayoutClient>{children}</MainLayoutClient>;
}
