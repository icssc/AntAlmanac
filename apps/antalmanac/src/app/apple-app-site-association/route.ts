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
 * ## Values below
 *
 * Both the Team ID and Bundle IDs are public — the AASA file is fetched by
 * Apple's CDN over plain HTTPS and is visible in every signed App Store
 * binary. They're hardcoded here intentionally (no secret manager needed).
 *
 * - `TEAM_ID`: 10-char Apple Developer Team ID from developer.apple.com ->
 *   Membership. Same for every app under the ICSSC org.
 * - `BUNDLE_IDS`: every bundle ID that should resolve Universal Links for
 *   antalmanac.com. List both the production App Store bundle and the
 *   TestFlight bundle so OAuth callbacks work in either build.
 *
 * ## Operational notes
 *
 * - Apple's CDN aggressively caches AASA files. After changing this file,
 *   uninstall + reinstall the app or run `sudo swcutil dl -d antalmanac.com`
 *   on a Mac to force a refresh. Changes can take up to 24 hours to roll
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

const TEAM_ID = '66682RDDDK';

// Universal Links. Must list every bundle ID that ships with Associated Domains
// for antalmanac.com. ASWebAuthenticationSession's `.https(host:path:)` callback (iOS
// 17.4+) requires a matching `TEAM_ID.bundleId` entry here — if the installed app's
// bundle ID is missing, OAuth redirects to `/auth/native` open in Safari and the auth
// flow never returns to the WKWebView wrapper.
//
// Keep historical IDs until no installs remain; Xcode `PRODUCT_BUNDLE_IDENTIFIER` lives
// in apps/pwa/src/AntAlmanac.xcodeproj/project.pbxproj.
const BUNDLE_IDS: readonly string[] = [
    'com.antalmanac',
    // 'com.icssc.antalmanac', // App Store production — uncomment when registered
];

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
                    {
                        '/': '/planner/api/users/auth/google/callback/native',
                        comment: 'Planner iOS OAuth callback (Universal-Link sink, rewritten by Swift)',
                    },
                ],
            },
        ],
    },
    webcredentials: {
        apps: appIDs,
    },
} as const;

export function GET() {
    // Defensive: if someone nukes the values above, serve 404 instead of a
    // malformed AASA that Apple will aggressively cache.
    if (TEAM_ID.length === 0 || appIDs.length === 0) {
        return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(aasa, {
        headers: {
            'Content-Type': 'application/json',
            // Short cache so edits propagate quickly after deploy.
            // Apple's fetcher ignores most caching headers anyway.
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        },
    });
}
