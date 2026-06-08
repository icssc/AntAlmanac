import { postHog } from '$providers/AppPostHogProvider';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export function PosthogPageviewTracker() {
    const location = useLocation();

    useEffect(() => {
        postHog.capture('$pageview', {
            path: location.pathname + location.search,
        });
    }, [location]);

    return null;
}
