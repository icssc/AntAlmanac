'use client';

import { ErrorPage } from '$routes/ErrorPage';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
    return <ErrorPage error={error} reset={reset} />;
}
