import {
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_PLANNER_KEY,
} from '$components/RightPane/CoursePane/SearchParams/constants';
import { hasAdvancedParams, hasManualParams } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { loadCourseSearchParams, loadSearchMode } from '$components/RightPane/CoursePane/SearchParams/loaders';
import { AUTH_PROVIDER_ID } from '$lib/auth/authConstants';
import { getSsoResponseCookieAttributes, SSO_COOKIE_NAME } from '$lib/ssoCookie';
import { TAB_HREF, type TabName } from '$lib/tabs/tabs';
import { getSessionCookie } from 'better-auth/cookies';
import { NextResponse, userAgent } from 'next/server';
import type { NextRequest } from 'next/server';

/** Logged-in users landing on bare `/` go to their default tab (document navigations only). */
function maybeRedirectDefaultTab(request: NextRequest): NextResponse | null {
    if (request.method !== 'GET' || request.nextUrl.pathname !== '/') {
        return null;
    }

    // Skip RSC/tab fetches — only redirect full page loads.
    const fetchMode = request.headers.get('sec-fetch-mode');
    if (fetchMode != null && fetchMode !== 'navigate') {
        return null;
    }

    const { searchParams } = request.nextUrl;

    if (searchParams.has(COURSE_SEARCH_PLANNER_KEY)) {
        return null;
    }

    if (!getSessionCookie(request)) {
        return null;
    }

    const formData = loadCourseSearchParams(searchParams);
    const searchMode = loadSearchMode(searchParams)[COURSE_SEARCH_MODE_KEY];

    if (searchMode === COURSE_SEARCH_MODE.MANUAL) {
        return null;
    }

    if (hasManualParams(formData) || hasAdvancedParams(formData)) {
        return null;
    }

    const { device } = userAgent({ headers: request.headers });
    const isMobile = device.type === 'mobile' || device.type === 'tablet';
    const defaultTab: TabName = isMobile ? 'calendar' : 'added';

    return NextResponse.redirect(new URL(TAB_HREF[defaultTab], request.url));
}

function handleAuthCallback(request: NextRequest): NextResponse {
    let response = NextResponse.next();

    if (request.nextUrl.searchParams.get('error') === 'login_required') {
        response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.set(SSO_COOKIE_NAME, '', {
            ...getSsoResponseCookieAttributes(request.nextUrl),
            maxAge: 0,
        });
    }

    return response;
}

export function proxy(request: NextRequest) {
    const defaultTabRedirect = maybeRedirectDefaultTab(request);
    if (defaultTabRedirect) {
        return defaultTabRedirect;
    }

    if (request.nextUrl.pathname === `/api/auth/oauth2/callback/${AUTH_PROVIDER_ID}`) {
        return handleAuthCallback(request);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/', '/api/auth/oauth2/callback/icssc'],
};
