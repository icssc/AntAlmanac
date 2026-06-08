import { postHog } from '$providers/AppPostHogProvider';
import { usePathname, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

export function PosthogPageviewTracker() {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const search = searchParams.toString();
        postHog.capture('$pageview', {
            path: search ? `${pathname}?${search}` : pathname,
        });
    }, [pathname, searchParams]);

    return null;
}
