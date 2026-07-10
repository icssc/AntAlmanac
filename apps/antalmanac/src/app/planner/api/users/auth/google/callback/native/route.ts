import { type NextRequest, NextResponse } from 'next/server';

/**
 * Fallback for the native-only iOS callback path (see the AASA route).
 *
 * In the normal native flow, ASWebAuthenticationSession captures the callback
 * URL via AASA before any network request is made. This route exists as a
 * safety net for the narrow window where AASA has not yet propagated: the
 * flow still recovers gracefully inside the WKWebView instead of 404ing.
 */
export function GET(request: NextRequest) {
    return NextResponse.redirect(
        `${request.nextUrl.origin}/api/auth/oauth2/callback/icssc${request.nextUrl.search}`,
        302
    );
}
