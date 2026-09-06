import {
    IOS_APP_STORE_PLATFORM_COOKIE,
    getSafeAuthRedirectPath,
    getSignInAuthorizationUrlParams,
    hasIosAppStorePlatformCookie,
} from '$lib/auth/authUtils';
import { describe, expect, test } from 'vitest';

const VALID_URL = '/importRoadmap=1234&term=2026+Spring';
const ALLOWED_ORIGIN = 'https://www.antalmanac.com';

describe('getSafeAuthRedirectPath', () => {
    test('Returns valid URL', () => {
        expect(getSafeAuthRedirectPath(VALID_URL, ALLOWED_ORIGIN, ALLOWED_ORIGIN)).toStrictEqual(
            ALLOWED_ORIGIN + VALID_URL
        );
    });

    test('Returns root if URL origin is not allowed', () => {
        expect(getSafeAuthRedirectPath('https://www.google.com', ALLOWED_ORIGIN, ALLOWED_ORIGIN)).toStrictEqual('/');
    });
});

describe('hasIosAppStorePlatformCookie', () => {
    const { name, value } = IOS_APP_STORE_PLATFORM_COOKIE;

    test('detects the native iOS platform cookie', () => {
        expect(hasIosAppStorePlatformCookie(`${name}=${value}`)).toBe(true);
    });

    test('detects a URI-encoded cookie value among other cookies', () => {
        expect(
            hasIosAppStorePlatformCookie(`icssc_logged_in=1; ${name}=${encodeURIComponent(value)}; other=1`)
        ).toBe(true);
    });

    test('ignores a similarly named cookie with a different value', () => {
        expect(hasIosAppStorePlatformCookie(`${name}=android`)).toBe(false);
        expect(hasIosAppStorePlatformCookie('')).toBe(false);
    });
});

describe('getSignInAuthorizationUrlParams', () => {
    const iosCookies = `${IOS_APP_STORE_PLATFORM_COOKIE.name}=${IOS_APP_STORE_PLATFORM_COOKIE.value}`;

    test('uses prompt=none for silent SSO even in the iOS app', () => {
        expect(getSignInAuthorizationUrlParams({ silent: true, cookieString: iosCookies })).toStrictEqual({
            prompt: 'none',
        });
    });

    test('uses prompt=consent for interactive iOS App Store sign-in', () => {
        expect(getSignInAuthorizationUrlParams({ silent: false, cookieString: iosCookies })).toStrictEqual({
            prompt: 'consent',
        });
    });

    test('omits prompt for interactive browser sign-in', () => {
        expect(getSignInAuthorizationUrlParams({ silent: false, cookieString: '' })).toBeUndefined();
    });
});
