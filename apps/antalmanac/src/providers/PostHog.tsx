import { PostHog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';

let _postHog: PostHog | null = null;

/**
 * Lazily initialized PostHog instance. PostHog's constructor accesses `self`
 * which is unavailable during SSR/static generation. This getter ensures
 * the instance is only created in the browser.
 */
function getPostHog(): PostHog {
    if (_postHog) {
        return _postHog;
    }

    _postHog = new PostHog();

    if (process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
        _postHog.init(process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY, {
            api_host: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
            capture_pageview: false,
            autocapture: false,
        });
    } else {
        console.warn('PostHog not initialized: Missing API key');
    }

    return _postHog;
}

/**
 * PostHog client instance. Only access this from client-side code (components,
 * event handlers, effects). During SSR this is a no-op proxy that safely
 * ignores calls.
 */
export const postHog: PostHog =
    typeof self !== 'undefined'
        ? getPostHog()
        : (new Proxy({} as PostHog, {
              get: () => () => undefined,
          }) as PostHog);

interface Props {
    children?: React.ReactNode;
}

export default function AppPostHogProvider(props: Props) {
    if (typeof window === 'undefined' || !process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
        return <>{props.children}</>;
    }
    return <PostHogProvider client={getPostHog()}>{props.children}</PostHogProvider>;
}
