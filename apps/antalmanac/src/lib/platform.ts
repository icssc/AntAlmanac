/**
 * Detects whether the web app is running inside the AntAlmanac native iOS
 * wrapper (see `apps/pwa`) rather than a regular browser.
 *
 * The wrapper injects a first-party cookie `app-platform=iOS App Store` on
 * the root domain at WKWebView init time (see
 * `apps/pwa/src/AntAlmanac/WebView.swift` `setCustomCookie`). The cookie is
 * not HttpOnly, so it is readable from `document.cookie` here.
 */

const NATIVE_IOS_COOKIE = 'app-platform=iOS App Store';

/**
 * `true` when the caller is running inside the native iOS wrapper.
 *
 * Safe to call during SSR: returns `false` when `document` is undefined.
 */
export function isNativeIosApp(): boolean {
    if (typeof document === 'undefined') return false;
    return document.cookie.includes(NATIVE_IOS_COOKIE);
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
