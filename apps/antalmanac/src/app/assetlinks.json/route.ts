import { NextResponse } from 'next/server';

/**
 * Digital Asset Links file (Android equivalent of Apple's AASA).
 *
 * Served at `https://antalmanac.com/.well-known/assetlinks.json` (via a
 * rewrite in `next.config.mjs`). Android's
 * Intent Filter Verifier fetches this on install (and periodically thereafter)
 * to decide whether to route https links for `antalmanac.com` to the AntAlmanac
 * Android app instead of the browser. Without it, intent filters with
 * `android:autoVerify="true"` fail verification and links fall back to
 * Chrome.
 *
 * The matching package name + SHA-256 signing cert fingerprint must appear in
 * a `delegate_permission/common.handle_all_urls` target, and the app's
 * `AndroidManifest.xml` must declare an intent filter for the same host with
 * `autoVerify="true"`.
 *
 * ## Values below
 *
 * Both the package name and SHA-256 fingerprint are public — assetlinks.json
 * is fetched by the Android verifier over plain HTTPS and the fingerprint is
 * derivable from any signed APK. They're hardcoded here intentionally.
 *
 * - `PACKAGE_NAME`: AndroidManifest `package` attribute / Gradle
 *   `applicationId`. Production build uses `com.icssc.antalmanac`; staging /
 *   debug builds use a suffix variant (e.g. `com.icssc.antalmanac.debug`)
 *   which is intentionally not listed here so debug builds don't claim
 *   production links.
 * - `SHA256_FINGERPRINTS`: upper-cased colon-separated SHA-256 of the APK
 *   signing cert. List both the upload key fingerprint (for non-Play-Store
 *   installs) and the Play App Signing fingerprint (shown in Play Console ->
 *   Setup -> App integrity) so both surfaces verify cleanly.
 *
 * ## Operational notes
 *
 * - Android caches verification results. After updating fingerprints, the
 *   user (or `adb shell pm verify-app-links --re-verify <package>`) must
 *   re-trigger verification. Changes can take time to propagate.
 *
 * - The file must be served at the literal path
 *   `/.well-known/assetlinks.json` (with the `.json` extension, unlike AASA)
 *   with `Content-Type: application/json`.
 *
 * - References:
 *   - https://developer.android.com/training/app-links/verify-android-applinks
 *   - https://developers.google.com/digital-asset-links/v1/getting-started
 */

const PACKAGE_NAME = 'com.icssc.antalmanac';

// SHA-256 fingerprints (uppercase, colon-separated) of the signing certs
// authorized to claim antalmanac.com App Links. Add the Play App Signing
// fingerprint once published to the Play Store.
const SHA256_FINGERPRINTS: readonly string[] = [
    // 'AA:BB:CC:...:FF', // upload key — fill in once a release key is generated
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
    // verifier records an unambiguous failure instead of caching an empty
    // success.
    if (assetlinks.length === 0) {
        return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(assetlinks, {
        headers: {
            'Content-Type': 'application/json',
            // Short cache so edits propagate quickly after deploy.
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        },
    });
}
