/**
 * PostHog initialization via Next.js instrumentation-client.
 *
 * This file is loaded once on the client before the React tree mounts,
 * allowing PostHog to initialize in parallel with hydration rather than
 * blocking the React render tree.
 *
 * Using `capture_pageview: 'history_change'` enables automatic SPA pageview
 * tracking, eliminating the need for a manual PosthogPageviewTracker component.
 *
 * @see https://posthog.com/docs/libraries/next-js — instrumentation-client setup
 * @see https://posthog.com/docs/libraries/js/config — configuration options
 */
import posthog from 'posthog-js';

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
        capture_pageview: 'history_change',
        autocapture: false,
        disable_surveys: true,
        capture_dead_clicks: false,
    });
}
