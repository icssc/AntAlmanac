import { postHog } from '$providers/PostHog';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export default function PosthogPageviewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        postHog.capture('$pageview', {
            path: pathname + (searchParams.toString() ? `?${searchParams.toString()}` : ''),
        });
    }, [pathname, searchParams]);

    return null;
}
