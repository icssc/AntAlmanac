import { PostHog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export const postHog = new PostHog();

if (process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
    postHog.init(process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
        capture_pageview: false,
        autocapture: false,
    });
} else {
    console.warn('PostHog not initialized: Missing API key');
}

interface Props {
    children?: React.ReactNode;
}

export default function AppPostHogProvider(props: Props) {
    if (process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
        return <PostHogProvider client={postHog}>{props.children}</PostHogProvider>;
    }
    return <>{props.children}</>;
}