const NATIVE_IOS_COOKIE = 'app-platform=iOS App Store';

export function isNativeIosApp(): boolean {
    if (typeof document === 'undefined') {
        return false;
    }

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
