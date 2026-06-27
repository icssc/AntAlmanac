'use client';

import { createContext, useContext } from 'react';

const UserAgentContext = createContext(false);

export function UserAgentProvider({ isMobile, children }: { isMobile: boolean; children: React.ReactNode }) {
    return <UserAgentContext.Provider value={isMobile}>{children}</UserAgentContext.Provider>;
}

export function useUserAgent() {
    return useContext(UserAgentContext);
}
