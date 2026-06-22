import { getPosthogPreconnectOrigins } from '$lib/posthog-preconnect';
import { describe, expect, test } from 'vitest';

describe('getPosthogPreconnectOrigins', () => {
    test('returns API and asset origins for US PostHog hosts', () => {
        expect(getPosthogPreconnectOrigins('https://us.i.posthog.com')).toStrictEqual([
            'https://us.i.posthog.com',
            'https://us-assets.i.posthog.com',
        ]);
    });

    test('returns only the configured origin for custom hosts', () => {
        expect(getPosthogPreconnectOrigins('https://analytics.example.com')).toStrictEqual([
            'https://analytics.example.com',
        ]);
    });

    test('returns an empty list when analytics is not configured', () => {
        expect(getPosthogPreconnectOrigins(undefined)).toStrictEqual([]);
        expect(getPosthogPreconnectOrigins('')).toStrictEqual([]);
        expect(getPosthogPreconnectOrigins('not-a-url')).toStrictEqual([]);
    });
});
