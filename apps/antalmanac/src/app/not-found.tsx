import { NotFoundPage } from '$components/standalone/NotFoundPage';
import { StandaloneProviders } from '$components/standalone/StandaloneProviders';

export default function NotFound() {
    return (
        <StandaloneProviders>
            <NotFoundPage />
        </StandaloneProviders>
    );
}
