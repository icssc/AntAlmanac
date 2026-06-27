'use client';

import type { userAgent as parseUserAgent } from 'next/server';
import { createContext, useContext } from 'react';

export type UserAgent = ReturnType<typeof parseUserAgent>;

const UserAgentContext = createContext<UserAgent | null>(null);

export function UserAgentProvider({ userAgent, children }: { userAgent: UserAgent; children: React.ReactNode }) {
    return <UserAgentContext.Provider value={userAgent}>{children}</UserAgentContext.Provider>;
}

export function useUserAgent() {
    const userAgent = useContext(UserAgentContext);
    if (userAgent == null) {
        throw new Error('useUserAgent must be used within UserAgentProvider');
    }
    return userAgent;
}
