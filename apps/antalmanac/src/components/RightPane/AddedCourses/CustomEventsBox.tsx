import { CustomEventDetailView } from '$components/RightPane/AddedCourses/CustomEventDetailView';
import { useScheduleViewSource } from '$lib/schedule/ScheduleViewContext';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box, Typography } from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function CustomEventsBox() {
    const scheduleSource = useScheduleViewSource();
    const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore(
        useShallow((store) => ({
            fallbackMode: store.fallbackMode,
            getCurrentFallbackSchedule: store.getCurrentFallbackSchedule,
        }))
    );
    const currentScheduleIndex = scheduleSource.getCurrentScheduleIndex();

    const [customEvents, setCustomEvents] = useState<RepeatingCustomEvent[]>(() => {
        if (fallbackMode) {
            return getCurrentFallbackSchedule(currentScheduleIndex).customEvents;
        }
        return scheduleSource.schedule.getCurrentCustomEvents();
    });
    const [scheduleNames, setScheduleNames] = useState(scheduleSource.getScheduleNames());

    useEffect(() => {
        const syncFromSource = () => {
            const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore.getState();
            if (fallbackMode) {
                const idx = AppStore.getCurrentScheduleIndex();
                setCustomEvents([...getCurrentFallbackSchedule(idx).customEvents]);
                setScheduleNames([...AppStore.getScheduleNames()]);
            } else {
                setCustomEvents([...scheduleSource.schedule.getCurrentCustomEvents()]);
                setScheduleNames([...scheduleSource.getScheduleNames()]);
            }
        };

        syncFromSource();
        return scheduleSource.subscribe(syncFromSource);
    }, [scheduleSource]);

    if (customEvents.length <= 0) {
        return null;
    }

    return (
        <>
            <Typography variant="h6">Custom Events</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
                {customEvents.map((customEvent) => {
                    return (
                        <Box key={customEvent.customEventID}>
                            <CustomEventDetailView customEvent={customEvent} scheduleNames={scheduleNames} />
                        </Box>
                    );
                })}
            </Box>
        </>
    );
}
