'use client';

import type { userAgent as parseUserAgent } from 'next/server';
import { createContext, useContext } from 'react';

export type ParsedUserAgent = ReturnType<typeof parseUserAgent>;

const defaultUserAgent: ParsedUserAgent = {
    isBot: false,
    ua: '',
    browser: {},
    device: {},
    engine: {},
    os: {},
    cpu: {},
};

const UserAgentContext = createContext(defaultUserAgent);

export function UserAgentProvider({
    userAgent,
    children,
}: {
    userAgent: ParsedUserAgent;
    children: React.ReactNode;
}) {
    return <UserAgentContext.Provider value={userAgent}>{children}</UserAgentContext.Provider>;
}

export function useUserAgent() {
    return useContext(UserAgentContext);
}
