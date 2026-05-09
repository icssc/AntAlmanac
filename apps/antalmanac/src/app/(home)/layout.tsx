import { HomeShell } from '$src/app/(home)/HomeShell';

export default function HomeLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            {children}
            <HomeShell />
        </>
    );
}
