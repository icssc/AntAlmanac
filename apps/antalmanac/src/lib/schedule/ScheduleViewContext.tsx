'use client';

import { friendScheduleViewSource } from '$lib/schedule/friendScheduleViewSource';
import type { ScheduleViewSource } from '$lib/schedule/ScheduleViewSource';
import AppStore from '$stores/AppStore';
import { createContext, useContext, type ReactNode } from 'react';

const ScheduleViewContext = createContext<ScheduleViewSource>(AppStore);

export function ScheduleViewProvider({ source, children }: { source: ScheduleViewSource; children: ReactNode }) {
    return <ScheduleViewContext.Provider value={source}>{children}</ScheduleViewContext.Provider>;
}

/** Provider for the friend schedule dialog — calendar reads from FriendsStore, not AppStore. */
export function FriendScheduleViewProvider({ children }: { children: ReactNode }) {
    return <ScheduleViewProvider source={friendScheduleViewSource}>{children}</ScheduleViewProvider>;
}

export function useScheduleViewSource(): ScheduleViewSource {
    return useContext(ScheduleViewContext);
}
