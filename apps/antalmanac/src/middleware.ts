import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const OUTAGE = process.env.NEXT_PUBLIC_OUTAGE === 'true';

export function middleware(request: NextRequest) {
    if (!OUTAGE) {
        return NextResponse.next();
    }

    const { pathname } = request.nextUrl;

    if (pathname === '/outage' || pathname.startsWith('/api') || pathname.startsWith('/_next')) {
        return NextResponse.next();
    }

    return NextResponse.redirect(new URL('/outage', request.url));
}

export const config = {
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
