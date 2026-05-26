'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type FriendScheduleTab = 'search' | 'added' | 'map';

interface FriendScheduleTabContextValue {
    activeTab: FriendScheduleTab;
    setActiveTab: (tab: FriendScheduleTab) => void;
}

const FriendScheduleTabContext = createContext<FriendScheduleTabContextValue | null>(null);

export function FriendScheduleTabProvider({
    activeTab,
    setActiveTab,
    children,
}: FriendScheduleTabContextValue & { children: ReactNode }) {
    return (
        <FriendScheduleTabContext.Provider value={{ activeTab, setActiveTab }}>
            {children}
        </FriendScheduleTabContext.Provider>
    );
}

export function useFriendScheduleTab() {
    return useContext(FriendScheduleTabContext);
}
