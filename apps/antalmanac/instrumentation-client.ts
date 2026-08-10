// @see https://posthog.com/docs/libraries/next-js
import posthog from 'posthog-js';

if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY) {
    posthog.init(process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_KEY, {
        api_host: process.env.NEXT_PUBLIC_PUBLIC_POSTHOG_HOST,
        capture_pageview: 'history_change',
        autocapture: false,
        disable_surveys: true,
        capture_dead_clicks: false,
        external_scripts_inject_target: 'head',
    });
}
