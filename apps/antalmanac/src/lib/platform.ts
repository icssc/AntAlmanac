const NATIVE_IOS_COOKIE = 'app-platform=iOS App Store';

/**
 * Bubblewrap / PWABuilder defaults the TWA package ID to `com.icssc.antalmanac`.
 * Chrome sets `document.referrer` to `android-app://<package>/` when the TWA
 * launches its start URL, which is the canonical "am I running inside the
 * TWA?" signal. (See https://chromium.googlesource.com/chromium/src/+/refs/heads/main/docs/android_app_referrer.md.)
 *
 * No analogue of the iOS platform cookie exists, because a TWA *is* Chrome —
 * the wrapper has no opportunity to seed cookies before the page loads.
 */
const ANDROID_TWA_REFERRER_PREFIX = 'android-app://com.icssc.antalmanac';

export function isNativeIosApp(): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

    return document.cookie.includes(NATIVE_IOS_COOKIE);
}

export function isNativeAndroidApp(): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

    return document.referrer.startsWith(ANDROID_TWA_REFERRER_PREFIX);
}

export function isNativeApp(): boolean {
    return isNativeIosApp() || isNativeAndroidApp();
}

/**
 * OAuth redirect URI used when signing in from inside the native iOS wrapper.
 *
 * This is a Universal Link (an https URL backed by the AASA file at
 * https://antalmanac.com/.well-known/apple-app-site-association) rather than a
 * custom URL scheme. Apple's ASWebAuthenticationSession (iOS 17.4+) matches
 * this callback via the AASA association, so only the AASA-verified AntAlmanac
 * binary can receive it. Custom schemes (`antalmanac://`) are spoofable across
 * apps on the same device and are intentionally not used.
 *
 * The matching redirect URI must be registered on the OIDC provider
 * (auth.icssc.club) for the AntAlmanac OAuth client, and the path must be
 * listed in the AASA file's `applinks` components.
 */
export const NATIVE_IOS_REDIRECT_URI = 'https://antalmanac.com/auth/native';

// The Android TWA delegates OAuth to the user's default Chrome instance
// (it *is* a Chrome instance), so Google's embedded-webview rejection
// doesn't apply and no Android-specific redirect URI is needed — the
// regular `/auth` callback works.
