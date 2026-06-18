/** Coarse mobile UA check for SSR layout defaults. Viewport media queries refine after hydration. */
export function isMobileUserAgent(userAgent: string): boolean {
    return /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini|Mobi/i.test(userAgent);
}
