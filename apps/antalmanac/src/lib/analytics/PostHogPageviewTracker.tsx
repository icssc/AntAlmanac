import { ensurePostHogInitialized, postHog } from '$providers/AppPostHogProvider';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function PosthogPageviewTracker() {
    const location = useLocation();

    useEffect(() => {
        void ensurePostHogInitialized().then(() => {
            postHog.capture('$pageview', {
                path: location.pathname + location.search,
            });
        });
    }, [location]);

    return null;
}
