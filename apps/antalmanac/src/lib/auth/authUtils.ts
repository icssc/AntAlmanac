import { Provider } from '$lib/auth/authTypes';

/** Must match `platformCookie` in apps/ios/src/AntAlmanac/Settings.swift. */
export const IOS_APP_STORE_PLATFORM_COOKIE = {
    name: 'app-platform',
    value: 'iOS App Store',
} as const;

export function hasIosAppStorePlatformCookie(cookieString: string): boolean {
    const { name, value } = IOS_APP_STORE_PLATFORM_COOKIE;
    const encodedValue = encodeURIComponent(value);
    return cookieString.split(';').some((part) => {
        const trimmed = part.trim();
        const separator = trimmed.indexOf('=');
        if (separator === -1) {
            return false;
        }
        const cookieName = trimmed.slice(0, separator);
        const cookieValue = trimmed.slice(separator + 1);
        return cookieName === name && (cookieValue === value || cookieValue === encodedValue);
    });
}

/**
 * OIDC `prompt` for /authorize.
 *
 * auth.icssc.club only skips an existing `sid` session when `prompt=consent`
 * (`prompt=login` is not in its query schema). The iOS App Store wrapper signs
 * in via ASWebAuthenticationSession, so `sid` lives in Safari. Until that
 * session is revoked, a leftover cookie would ignore the chosen provider
 * (Google vs Apple). Interactive iOS sign-in therefore always sends consent.
 */
export function getSignInAuthorizationUrlParams({
    silent,
    cookieString,
}: {
    silent: boolean;
    cookieString: string;
}): { prompt: 'none' } | { prompt: 'consent' } | undefined {
    if (silent) {
        return { prompt: 'none' };
    }
    if (hasIosAppStorePlatformCookie(cookieString)) {
        return { prompt: 'consent' };
    }
    return undefined;
}

export const getSafeAuthRedirectPath = (
    redirectUrl: string | null | undefined,
    requestUrl: string | null | undefined,
    allowedOrigin: string
): string => {
    if (!redirectUrl) {
        return '/';
    }

    try {
        const requestOrigin = requestUrl ? new URL(requestUrl).origin : allowedOrigin;
        const url = new URL(redirectUrl, requestOrigin);
        if (url.origin === allowedOrigin) {
            return url.toString();
        }
        return '/';
    } catch {
        return '/';
    }
};

export function getProviderDisplayName(provider: Provider) {
    switch (provider) {
        case Provider.Google:
            return 'Google';
        case Provider.Apple:
            return 'Apple';
        default:
            console.error('Unrecognized provider:', provider);
            return '';
    }
}

export function getProviderIcsscName(provider: Provider) {
    switch (provider) {
        case Provider.Google:
            return 'google';
        case Provider.Apple:
            return 'apple';
        default:
            console.error('Unrecognized provider:', provider);
            return '';
    }
}
