const NATIVE_IOS_COOKIE = 'app-platform=iOS App Store';
const NATIVE_ANDROID_COOKIE = 'app-platform=Google Play';

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

    return document.cookie.includes(NATIVE_ANDROID_COOKIE);
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

/**
 * OAuth redirect URI used when signing in from inside the native Android wrapper.
 *
 * The Android equivalent of iOS Universal Links is Android App Links — an https
 * URL backed by the Digital Asset Links file at
 * https://antalmanac.com/.well-known/assetlinks.json. When the device verifier
 * confirms the association, intents for this URL route to the AntAlmanac app's
 * AppLinkRedirectActivity instead of opening a browser. The Custom Tab launched
 * by `MainActivity` for OAuth thus terminates back inside the app, where the
 * `/native` suffix is stripped and the cookie-bearing WKWebView equivalent
 * (the in-app WebView) completes the code exchange.
 *
 * Custom URL schemes (`antalmanac://`) are spoofable across apps on the same
 * device and are intentionally not used.
 *
 * The matching redirect URI must be registered on the OIDC provider
 * (auth.icssc.club) for the AntAlmanac OAuth client, and the path must be
 * listed in the assetlinks.json file's `target` declarations alongside the
 * Android package name and SHA-256 cert fingerprint.
 */
export const NATIVE_ANDROID_REDIRECT_URI = 'https://antalmanac.com/auth/native';
