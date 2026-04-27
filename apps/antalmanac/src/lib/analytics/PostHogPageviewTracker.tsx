import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { postHog } from '$providers/PostHog';

export default function PosthogPageviewTracker() {
    const location = useLocation();

    useEffect(() => {
        postHog.capture('$pageview', {
            path: location.pathname + location.search,
        });
    }, [location]);

    return null;
}
