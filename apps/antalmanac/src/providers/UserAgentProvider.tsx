'use client';

import { createContext, useContext } from 'react';

const IsMobileSsrContext = createContext(false);

export function UserAgentProvider({ isMobile, children }: { isMobile: boolean; children: React.ReactNode }) {
    return <IsMobileSsrContext.Provider value={isMobile}>{children}</IsMobileSsrContext.Provider>;
}

export function useSsrIsMobile() {
    return useContext(IsMobileSsrContext);
}
