import { postHog } from '$providers/PostHog';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PosthogPageviewTracker() {
    const location = useLocation();

    useEffect(() => {
        postHog.capture('$pageview', {
            path: location.pathname + location.search,
        });
    }, [location]);

    return null;
}
