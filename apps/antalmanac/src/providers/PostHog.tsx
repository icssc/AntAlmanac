import { posthog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

interface Props {
    children?: React.ReactNode;
}

export default function AppPostHogProvider(props: Props) {
    if (process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
        posthog.init(process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY, {
            api_host: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
            capture_pageview: false,
            autocapture: false,
        });

        return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
    } else {
        console.warn('PostHog not initialized: Missing API key');
        return <>{props.children}</>;
    }
}
