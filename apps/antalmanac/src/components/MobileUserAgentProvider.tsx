'use client';

import { createContext, useContext } from 'react';

const MobileUserAgentContext = createContext(false);

export function MobileUserAgentProvider({
    isMobile,
    children,
}: {
    isMobile: boolean;
    children: React.ReactNode;
}) {
    return <MobileUserAgentContext.Provider value={isMobile}>{children}</MobileUserAgentContext.Provider>;
}

/** Device class from the request user-agent, set once on the server for SSR/hydration. */
export function useIsMobileUserAgent() {
    return useContext(MobileUserAgentContext);
}
