import { posthog } from 'posthog-js';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PosthogPageviewTracker() {
    const location = useLocation();

    useEffect(() => {
        posthog.capture('$pageview', {
            path: location.pathname + location.search,
        });
    }, [location]);

    return null;
}
