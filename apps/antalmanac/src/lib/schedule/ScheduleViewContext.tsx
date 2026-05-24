'use client';

import { appScheduleViewSource } from '$lib/schedule/appScheduleViewSource';
import type { ScheduleViewSource } from '$lib/schedule/ScheduleViewSource';
import { createContext, useContext, type ReactNode } from 'react';

const ScheduleViewContext = createContext<ScheduleViewSource>(appScheduleViewSource);

export function ScheduleViewProvider({ source, children }: { source: ScheduleViewSource; children: ReactNode }) {
    return <ScheduleViewContext.Provider value={source}>{children}</ScheduleViewContext.Provider>;
}

export function useScheduleViewSource(): ScheduleViewSource {
    return useContext(ScheduleViewContext);
}
