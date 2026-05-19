import { CustomEventDetailView } from '$components/RightPane/AddedCourses/CustomEventDetailView';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box, Typography } from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';
import { useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function CustomEventsBox() {
    const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore(
        useShallow((store) => ({
            fallbackMode: store.fallbackMode,
            getCurrentFallbackSchedule: store.getCurrentFallbackSchedule,
        }))
    );
    const currentScheduleIndex = AppStore.getCurrentScheduleIndex();

    const [customEvents, setCustomEvents] = useState<RepeatingCustomEvent[]>(
        fallbackMode
            ? getCurrentFallbackSchedule(currentScheduleIndex).customEvents
            : AppStore.schedule.getCurrentCustomEvents()
    );

    useEffect(() => {
        const handleCustomEventsChange = () => {
            const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore.getState();
            if (fallbackMode) {
                const idx = AppStore.getCurrentScheduleIndex();
                setCustomEvents([...getCurrentFallbackSchedule(idx).customEvents]);
            } else {
                setCustomEvents([...AppStore.schedule.getCurrentCustomEvents()]);
            }
        };

        AppStore.on('customEventsChange', handleCustomEventsChange);
        AppStore.on('currentScheduleIndexChange', handleCustomEventsChange);

        return () => {
            AppStore.off('customEventsChange', handleCustomEventsChange);
            AppStore.off('currentScheduleIndexChange', handleCustomEventsChange);
        };
    }, []);

    if (customEvents.length <= 0) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6">Custom Events</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
                {customEvents.map((customEvent) => {
                    return (
                        <Box key={customEvent.customEventID}>
                            <CustomEventDetailView
                                customEvent={customEvent}
                                scheduleNames={AppStore.getScheduleNames()}
                            />
                        </Box>
                    );
                })}
            </Box>
        </Box>
    );
}
