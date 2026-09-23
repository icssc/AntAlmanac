import { getSafeAuthRedirectPath } from '$lib/auth/authUtils';
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
