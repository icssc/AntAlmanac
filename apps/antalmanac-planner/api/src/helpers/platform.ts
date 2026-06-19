import type { Request } from 'express';

/**
 * Cookie set by the AntAlmanac iOS app's WKWebView on the antalmanac.com
 * domain. Because peterportal-client is served from antalmanac.com/planner,
 * this first-party cookie is visible on every request originating from inside
 * the native iOS wrapper.
 *
 * Mirrors AntAlmanac's apps/antalmanac/src/lib/platform.ts.
 */
const NATIVE_IOS_COOKIE = 'app-platform=iOS App Store';

/**
 * Returns true if the request originates from inside the AntAlmanac iOS app's
 * WKWebView. Used to branch the OAuth redirect_uri so that the iOS system
 * sign-in sheet (ASWebAuthenticationSession) can capture the callback via a
 * Universal Link on a dedicated `/callback/native` path (claimed by AASA),
 * without hijacking the real `/callback` path that web users depend on.
 */
export function isNativeIosApp(req: Pick<Request, 'headers'>): boolean {
  return (req.headers.cookie ?? '').includes(NATIVE_IOS_COOKIE);
}
