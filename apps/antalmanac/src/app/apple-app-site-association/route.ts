import { NextResponse } from 'next/server';

/**
 * Apple App Site Association (AASA) file.
 *
 * Served at `https://antalmanac.com/.well-known/apple-app-site-association`
 * (via a rewrite in `next.config.ts`).
 *
 * - `webcredentials`: lets ASWebAuthenticationSession use HTTPS callbacks on
 *   this domain (Better Auth redirect_uri is `/api/auth/oauth2/callback/icssc`).
 * - `applinks`: only lists `/native` planner sinks so Universal Links do not
 *   hijack normal mobile-Safari OAuth on shared antalmanac.com paths.
 *
 * @see apps/ios/src/AntAlmanac/ViewController.swift
 */

const TEAM_ID = '66682RDDDK';

const BUNDLE_IDS: readonly string[] = [
    'com.antalmanac',
    // 'com.icssc.antalmanac', // App Store production — uncomment when registered
];

const appIDs = BUNDLE_IDS.map((bundleId) => `${TEAM_ID}.${bundleId}`);

const aasa = {
    applinks: {
        details: [
            {
                appIDs,
                components: [
                    {
                        '/': '/planner/api/users/auth/google/callback/native',
                        comment: 'Planner iOS OAuth callback',
                    },
                ],
            },
        ],
    },
    webcredentials: {
        apps: appIDs,
    },
} as const;

export function GET() {
    if (TEAM_ID.length === 0 || appIDs.length === 0) {
        return new NextResponse('Not Found', { status: 404 });
    }

    return NextResponse.json(aasa, {
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
        },
    });
}
