import { PostHog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export const postHog = new PostHog();

interface Props {
    children?: React.ReactNode;
}

export default function AppPostHogProvider(props: Props) {
    useEffect(() => {
        if (process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
            postHog.init(process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY, {
                api_host: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
                capture_pageview: false,
                autocapture: false,
            });
        } else {
            console.warn('PostHog not initialized: Missing API key');
        }
    }, []);

    if (process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
        return <PostHogProvider client={postHog}>{props.children}</PostHogProvider>;
    }
    return <>{props.children}</>;
}
