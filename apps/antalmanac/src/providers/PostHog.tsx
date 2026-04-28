import { posthog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

interface Props {
    children?: React.ReactNode;
}

const POSTHOG_KEY = process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY;
const POSTHOG_HOST = process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST;

if (typeof window !== 'undefined') {
    if (POSTHOG_KEY) {
        posthog.init(POSTHOG_KEY, {
            api_host: POSTHOG_HOST,
            capture_pageview: false,
            autocapture: false,
        });
    } else {
        console.warn('PostHog not initialized: Missing API key');
    }
}

export default function AppPostHogProvider(props: Props) {
    if (!POSTHOG_KEY) {
        return props.children;
    }

    return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
}
