import { NextResponse } from 'next/server';

/**
 * Apple App Site Association (AASA) file.
 *
 * Served at `https://antalmanac.com/.well-known/apple-app-site-association`
 * (via a rewrite in `next.config.mjs`). Apple's CDN fetches this to:
 *
 * 1. Authorize the AntAlmanac iOS app to claim Universal Links for the
 *    `/auth/native` path — i.e. the OAuth redirect URI that the iOS wrapper
 *    hands to `ASWebAuthenticationSession` as its HTTPS callback
 *    (see `apps/pwa/src/AntAlmanac/ViewController.swift`). This binding is
 *    what makes the callback non-spoofable by other apps on the device.
 * 2. Authorize AA for shared web credentials, which enables passkey autofill
 *    and the Associated Domains `webcredentials` entitlement.
 *
 * ## Operational notes
 *
 * - The `appIDs` value is `TEAMID.BUNDLEID`. Both must be set for this to
 *   work. We read them from env vars so the same code runs against the
 *   TestFlight and production bundles without recompiling. Set these in the
 *   SST environment (see `sst.config.ts`).
 *   - `APPLE_TEAM_ID`: Apple Developer Team ID (10-char alphanumeric).
 *   - `APPLE_BUNDLE_IDS`: comma-separated list of bundle IDs (e.g.
 *     `com.icssc.antalmanac,com.antalmanac.testflight1127`). Typically one
 *     for prod and one for TestFlight; both are listed here so that both
 *     builds can resolve the same Universal Link.
 *
 * - Apple's CDN aggressively caches AASA files. After changing this file,
 *   uninstall + reinstall the app or use the `swcutil show --name 'applinks'`
 *   command to verify propagation. Changes can take up to 24 hours to roll
 *   out to new installs.
 *
 * - The file must be served with `Content-Type: application/json` and MUST
 *   NOT have a `.json` extension on the URL. The rewrite in
 *   `next.config.mjs` preserves the extensionless URL.
 *
 * - References:
 *   - https://developer.apple.com/documentation/xcode/supporting-associated-domains
 *   - https://developer.apple.com/documentation/bundleresources/applinks
 */

const TEAM_ID = process.env.APPLE_TEAM_ID ?? '';
const BUNDLE_IDS = (process.env.APPLE_BUNDLE_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

const appIDs = BUNDLE_IDS.map((bundleId) => `${TEAM_ID}.${bundleId}`);

const aasa = {
    applinks: {
        details: [
            {
                appIDs,
                components: [
                    // OAuth callback for the native iOS wrapper. See
                    // `apps/pwa/src/AntAlmanac/ViewController.swift` startAuthSession.
                    {
                        '/': '/auth/native',
                        comment: 'AntAlmanac iOS OAuth callback (ASWebAuthenticationSession)',
                    },
                ],
            },
        ],
    },
    webcredentials: {
        apps: appIDs,
    },
} as const;

export const runtime = 'edge';

export function GET() {
    // When the team/bundle IDs aren't configured in the environment, return 404
    // rather than serving a malformed AASA. An AASA with an empty appIDs array
    // is still cached aggressively by Apple's CDN and can be hard to revoke.
    if (appIDs.length === 0) {
        return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(aasa, {
        headers: {
            'Content-Type': 'application/json',
            // Short cache so env-var changes propagate quickly after deploy.
            // Apple's fetcher ignores most caching headers anyway.
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        },
    });
}
