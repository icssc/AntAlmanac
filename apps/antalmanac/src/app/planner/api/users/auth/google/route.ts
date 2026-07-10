import { getSignInUrl } from '$lib/auth/authActions';
import { Provider } from '$lib/auth/authTypes';
import { type NextRequest, NextResponse } from 'next/server';

/**
 * Legacy Planner sign-in URL, kept so existing Planner UI links and
 * bookmarks keep working. Redirects into the better-auth OAuth flow that
 * the rest of the merged app uses.
 *
 * Supported query params (mirroring the standalone Planner service):
 * - `provider`: `google` (default) or `apple`
 * - `prompt=none`: silent SSO attempt
 * - `next`: path to return to after sign-in (falls back to the referer)
 */
export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;
    const provider = params.get('provider') === 'apple' ? Provider.Apple : Provider.Google;

    let returnUrl = params.get('next') ?? undefined;
    if (!returnUrl) {
        const referer = request.headers.get('referer');
        if (referer) {
            try {
                const refererUrl = new URL(referer);
                if (refererUrl.origin === request.nextUrl.origin) {
                    returnUrl = `${refererUrl.pathname}${refererUrl.search}${refererUrl.hash}`;
                }
            } catch {
                // ignore malformed referer
            }
        }
    }

    const authUrl = await getSignInUrl(provider, {
        authorizationUrlParams: params.get('prompt') === 'none' ? { prompt: 'none' } : undefined,
        returnUrl: returnUrl ?? '/planner',
    });

    return NextResponse.redirect(authUrl);
}
