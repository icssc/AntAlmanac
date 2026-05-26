'use client';

import { createContext, useContext, type ReactNode } from 'react';

export type FriendScheduleTab = 'search' | 'added' | 'map';

interface FriendScheduleTabContextValue {
    activeTab: FriendScheduleTab;
    setActiveTab: (tab: FriendScheduleTab) => void;
    mapLocationId?: number;
    setMapLocationId: (locationId: number | undefined) => void;
    focusMapLocation: (buildingId: number) => void;
}

const FriendScheduleTabContext = createContext<FriendScheduleTabContextValue | null>(null);

export function FriendScheduleTabProvider({
    activeTab,
    setActiveTab,
    mapLocationId,
    setMapLocationId,
    focusMapLocation,
    children,
}: FriendScheduleTabContextValue & { children: ReactNode }) {
    return (
        <FriendScheduleTabContext.Provider
            value={{ activeTab, setActiveTab, mapLocationId, setMapLocationId, focusMapLocation }}
        >
            {children}
        </FriendScheduleTabContext.Provider>
    );
}

export function useFriendScheduleTab() {
    return useContext(FriendScheduleTabContext);
}
