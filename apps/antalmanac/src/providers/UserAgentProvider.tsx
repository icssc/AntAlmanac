'use client';

import { createContext, useContext } from 'react';

const UserAgentContext = createContext('');

export function UserAgentProvider({
    userAgent,
    children,
}: {
    userAgent: string;
    children: React.ReactNode;
}) {
    return <UserAgentContext.Provider value={userAgent}>{children}</UserAgentContext.Provider>;
}

export function useUserAgent() {
    return useContext(UserAgentContext);
}
