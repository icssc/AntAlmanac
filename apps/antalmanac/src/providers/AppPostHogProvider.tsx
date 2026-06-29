import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

export const postHog = posthog;

interface Props {
    children?: React.ReactNode;
}

export function AppPostHogProvider(props: Props) {
    return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
}
