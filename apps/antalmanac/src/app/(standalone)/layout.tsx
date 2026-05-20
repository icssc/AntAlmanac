import { StandaloneProviders } from '$components/standalone/StandaloneProviders';

export default function StandaloneLayout({ children }: { children: React.ReactNode }) {
    return <StandaloneProviders>{children}</StandaloneProviders>;
}
