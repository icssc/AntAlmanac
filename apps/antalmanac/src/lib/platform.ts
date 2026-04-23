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
 * OAuth redirect URI for the AntAlmanac client on auth.icssc.club that
 * delivers the callback to the native iOS wrapper via its registered custom
 * URL scheme (`CFBundleURLSchemes` in `apps/pwa/src/AntAlmanac/Info.plist`).
 *
 * Used in place of the default https redirect URI when the user is signing
 * in from inside the wrapper, so that ASWebAuthenticationSession can detect
 * the callback and hand it back to the app.
 */
export const NATIVE_IOS_REDIRECT_URI = 'antalmanac://auth';
