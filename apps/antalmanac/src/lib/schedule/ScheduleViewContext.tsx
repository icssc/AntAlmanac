'use client';

import type { ScheduleViewSource } from '$lib/schedule/ScheduleViewSource';
import AppStore from '$stores/AppStore';
import { createContext, useContext, type ReactNode } from 'react';

const ScheduleViewContext = createContext<ScheduleViewSource>(AppStore);

export function ScheduleViewProvider({ source, children }: { source: ScheduleViewSource; children: ReactNode }) {
    return <ScheduleViewContext.Provider value={source}>{children}</ScheduleViewContext.Provider>;
}

export function useScheduleViewSource(): ScheduleViewSource {
    return useContext(ScheduleViewContext);
}
