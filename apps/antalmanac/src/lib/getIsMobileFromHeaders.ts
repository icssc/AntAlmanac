import type { headers } from 'next/headers';
import { userAgent } from 'next/server';

type RequestHeaders = Awaited<ReturnType<typeof headers>>;

/** Uses Next.js `userAgent()` — same mobile/tablet check as the home page redirect. */
export function getIsMobileFromHeaders(requestHeaders: RequestHeaders): boolean {
    const { device } = userAgent({ headers: requestHeaders });
    return device.type === 'mobile' || device.type === 'tablet';
}
