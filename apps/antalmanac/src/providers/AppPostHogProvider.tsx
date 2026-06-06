'use client';

import { env } from '$src/env';
import { PostHog } from 'posthog-js';
import { PostHogProvider } from 'posthog-js/react';
import { useEffect } from 'react';

export const postHog = new PostHog();

const POSTHOG_INIT_OPTIONS = {
    api_host: env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
    capture_pageview: false,
    autocapture: false,
    disable_surveys: true,
    capture_dead_clicks: false,
} as const;

let initPromise: Promise<void> | null = null;

function isPostHogInitialized() {
    return Boolean((postHog as PostHog & { __loaded?: boolean }).__loaded);
}

/**
 * Initializes PostHog after idle so surveys, dead-clicks, and SDK work stay off the critical path.
 * Safe to call multiple times; resolves immediately once initialized.
 */
export function ensurePostHogInitialized(): Promise<void> {
    if (!env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
        return Promise.resolve();
    }

    if (isPostHogInitialized()) {
        return Promise.resolve();
    }

    if (initPromise) {
        return initPromise;
    }

    initPromise = new Promise((resolve) => {
        const runInit = () => {
            if (!isPostHogInitialized()) {
                postHog.init(env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY!, POSTHOG_INIT_OPTIONS);
            }
            resolve();
        };

        if ('requestIdleCallback' in window) {
            window.requestIdleCallback(runInit, { timeout: 3000 });
        } else {
            window.setTimeout(runInit, 2000);
        }
    });

    return initPromise;
}

interface Props {
    children?: React.ReactNode;
}

export default function AppPostHogProvider(props: Props) {
    useEffect(() => {
        if (!env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
            console.warn('PostHog not initialized: Missing API key');
            return;
        }

        void ensurePostHogInitialized();
    }, []);

    if (env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
        return <PostHogProvider client={postHog}>{props.children}</PostHogProvider>;
    }

    return <>{props.children}</>;
}
