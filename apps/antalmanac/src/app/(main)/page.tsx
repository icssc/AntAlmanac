import {
    COURSE_SEARCH_MODE,
    COURSE_SEARCH_MODE_KEY,
    COURSE_SEARCH_PLANNER_KEY,
} from '$components/RightPane/CoursePane/SearchParams/constants';
import { hasAdvancedParams, hasManualParams } from '$components/RightPane/CoursePane/SearchParams/helpers';
import { loadCourseSearchParams, loadSearchMode } from '$components/RightPane/CoursePane/SearchParams/loaders';
import { auth } from '$lib/auth/auth';
import { getIsMobileFromHeaders } from '$lib/getIsMobileFromHeaders';
import { TAB_HREF, type TabName } from '$lib/tabs/tabs';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Page({ searchParams }: PageProps<'/'>) {
    const requestHeaders = await headers();

    // Skip on in-app tab clicks (RSC fetches); redirect only on full document loads.
    const fetchMode = requestHeaders.get('sec-fetch-mode');
    if (fetchMode != null && fetchMode !== 'navigate') {
        return null;
    }

    const resolvedSearchParams = await searchParams;
    const session = await auth.api.getSession({ headers: requestHeaders });

    const isMobile = getIsMobileFromHeaders(requestHeaders);

    if (resolvedSearchParams[COURSE_SEARCH_PLANNER_KEY] != null) {
        return null;
    }

    if (!session?.user) {
        return null;
    }

    const formData = loadCourseSearchParams(resolvedSearchParams);
    const searchMode = loadSearchMode(resolvedSearchParams)[COURSE_SEARCH_MODE_KEY];

    if (searchMode === COURSE_SEARCH_MODE.MANUAL) {
        return null;
    }

    if (hasManualParams(formData) || hasAdvancedParams(formData)) {
        return null;
    }

    const defaultTab: TabName = isMobile ? 'calendar' : 'added';
    redirect(TAB_HREF[defaultTab]);
}
