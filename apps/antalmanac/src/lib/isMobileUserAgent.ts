import { userAgent } from 'next/server';

/** True when the request user-agent indicates a phone or tablet device. */
export function isMobileUserAgent(headers: Headers): boolean {
    const { device } = userAgent({ headers });
    return device.type === 'mobile' || device.type === 'tablet';
}
