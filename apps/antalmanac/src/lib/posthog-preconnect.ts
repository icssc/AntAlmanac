/**
 * Origins Lighthouse flags for PostHog when analytics is enabled.
 * @see https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/rel/preconnect
 */
export function getPosthogPreconnectOrigins(apiHost: string | undefined): string[] {
    if (!apiHost) {
        return [];
    }

    try {
        const url = new URL(apiHost);
        const origins = new Set<string>([url.origin]);

        // us.i.posthog.com -> us-assets.i.posthog.com
        const assetsHost = url.hostname.replace(/\.i\.posthog\.com$/, '-assets.i.posthog.com');
        if (assetsHost !== url.hostname) {
            origins.add(`https://${assetsHost}`);
        }

        return [...origins];
    } catch {
        return [];
    }
}
