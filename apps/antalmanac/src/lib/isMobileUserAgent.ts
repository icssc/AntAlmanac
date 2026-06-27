/** Coarse mobile UA check. Used server-side (proxy) and as useIsMobile SSR default. */
export function isMobileUserAgent(userAgent: string): boolean {
    return /Android|webOS|iPhone|iPod|iPad|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent);
}
