import { NextResponse } from 'next/server';

/**
 * Digital Asset Links file (Android counterpart of Apple's AASA).
 *
 * Served at `https://antalmanac.com/.well-known/assetlinks.json` (via a
 * rewrite in `next.config.mjs`). Two consumers:
 *
 *   1. **Trusted Web Activity (TWA) verification.** The AntAlmanac Android
 *      app is generated via PWABuilder / Bubblewrap and ships as a TWA — a
 *      Chrome-rendered, full-screen wrapper over antalmanac.com. Chrome
 *      only suppresses its browser chrome (URL bar, three-dot menu) when
 *      the wrapper's package + signing cert is listed here. Without it, the
 *      TWA still launches but renders as a Chrome Custom Tab — defeating
 *      the "feels like a native app" point of TWAs.
 *
 *   2. **Android App Links.** With `android:autoVerify="true"` intent
 *      filters in the manifest, the Android verifier fetches this file at
 *      install time and routes https://antalmanac.com/* into the app
 *      automatically instead of through a chooser.
 *
 * Both consumers verify the same `delegate_permission/common.handle_all_urls`
 * relation, so one entry per signing cert covers both.
 *
 * ## Values below
 *
 * Both the package name and SHA-256 fingerprint are public — assetlinks.json
 * is fetched over plain HTTPS and the fingerprint is derivable from any
 * signed APK. They're hardcoded here intentionally.
 *
 * - `PACKAGE_NAME`: the Bubblewrap-config `packageId` (matches the Gradle
 *   `applicationId` in `apps/pwa-android/app/build.gradle.kts` and the
 *   `host` field in `twa-manifest.json`). Production = `com.icssc.antalmanac`;
 *   debug builds use `.debug` suffix which is intentionally not listed here
 *   so debug builds don't claim production links.
 * - `SHA256_FINGERPRINTS`: upper-cased colon-separated SHA-256 of the APK
 *   signing certs. List both the upload key fingerprint (for sideloads) and
 *   the Play App Signing fingerprint (shown in Play Console -> Setup ->
 *   App integrity) so both surfaces verify cleanly.
 *
 * ## Operational notes
 *
 * - Android caches verification results. After updating fingerprints,
 *   `adb shell pm verify-app-links --re-verify <package>` forces a refresh
 *   on a connected device.
 *
 * - The file must be served at the literal path
 *   `/.well-known/assetlinks.json` with `Content-Type: application/json`.
 *
 * - References:
 *   - https://developer.chrome.com/docs/android/trusted-web-activity/quick-start
 *   - https://developer.android.com/training/app-links/verify-android-applinks
 *   - https://developers.google.com/digital-asset-links/v1/getting-started
 */

const PACKAGE_NAME = 'com.icssc.antalmanac';

// SHA-256 fingerprints (uppercase, colon-separated) of the signing certs
// authorized to claim antalmanac.com. Generated when Bubblewrap creates
// `apps/pwa-android/android.keystore` and shown again as the "App signing
// key" in the Play Console once an internal-test build is uploaded.
const SHA256_FINGERPRINTS: readonly string[] = [
    // 'AA:BB:CC:...:FF', // upload key — fill in after `bubblewrap init`
    // 'AA:BB:CC:...:FF', // Play App Signing key — fill in from Play Console
];

const assetlinks = SHA256_FINGERPRINTS.map((fingerprint) => ({
    relation: ['delegate_permission/common.handle_all_urls'],
    target: {
        namespace: 'android_app',
        package_name: PACKAGE_NAME,
        sha256_cert_fingerprints: [fingerprint],
    },
}));

export function GET() {
    // Defensive: if no fingerprints are configured, serve 404 so Android's
    // verifier records an unambiguous failure (and the TWA falls back to
    // Custom Tabs) instead of caching an empty success.
    if (assetlinks.length === 0) {
        return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(assetlinks, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        },
    });
}
