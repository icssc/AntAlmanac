import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const OUTAGE = false;

export function middleware(request: NextRequest) {
    if (!OUTAGE) {
        return NextResponse.next();
    }

    const { pathname } = request.nextUrl;

    if (
        pathname === '/outage' ||
        pathname.startsWith('/api/') ||
        pathname.startsWith('/_next/') ||
        pathname.includes('.')
    ) {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/outage', request.url));
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon|icons|screenshots|assets).*)'],
};
