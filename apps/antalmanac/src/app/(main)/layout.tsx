import { MainLayoutDynamic } from '$src/app/(main)/main-layout-dynamic';

export const dynamic = 'force-dynamic';

export default function MainLayout({ children }: { children: React.ReactNode }) {
    return <MainLayoutDynamic>{children}</MainLayoutDynamic>;
}
