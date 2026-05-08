import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const OUTAGE = false;

const ALLOWED_ORIGINS = [
    'https://antalmanac.com',
    'https://www.antalmanac.com',
    'https://sst.antalmanac.com',
    'https://www.sst.antalmanac.com',
    'https://icssc-projects.github.io',
    'https://auth.icssc.club',
    'http://localhost:5173',
    'http://localhost:3000',
];

const STAGING_PATTERN = /^https:\/\/staging-\d+\.antalmanac\.com$/;

function isOriginAllowed(origin: string | null): boolean {
    if (!origin) {
        return true;
    }

    if (ALLOWED_ORIGINS.includes(origin)) {
        return true;
    }
    if (STAGING_PATTERN.test(origin)) {
        return true;
    }

    return false;
}

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (OUTAGE && pathname !== '/outage' && !pathname.startsWith('/api/')) {
        return NextResponse.redirect(new URL('/outage', request.url));
    }

    const origin = request.headers.get('origin');

    if (request.method === 'OPTIONS') {
        if (!isOriginAllowed(origin)) {
            return new NextResponse(null, { status: 403 });
        }

        return new NextResponse(null, {
            status: 204,
            headers: {
                'Access-Control-Allow-Origin': origin || '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Credentials': 'true',
                'Access-Control-Max-Age': '86400',
            },
        });
    }

    const response = NextResponse.next();

    if (isOriginAllowed(origin)) {
        response.headers.set('Access-Control-Allow-Origin', origin || '*');
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }

    return response;
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon|icons|screenshots|assets).*)', '/api/:path*'],
};
