import posthog from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

/**
 * Re-export the PostHog singleton for imperative usage (e.g. logAnalytics).
 * Initialization happens in instrumentation-client.ts before the React tree mounts.
 */
export const postHog = posthog;

interface Props {
    children?: React.ReactNode;
}

/**
 * Provides the PostHog client to the React tree via context so that
 * `usePostHog()` hooks continue to work throughout the app.
 */
export function AppPostHogProvider(props: Props) {
    return <PostHogProvider client={posthog}>{props.children}</PostHogProvider>;
}
