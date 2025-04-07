import { Box, Typography } from '@mui/material';
import { useState, useEffect } from 'react';

import CustomEventDetailView from '$components/RightPane/AddedCoursePane/CustomEventDetailView';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';

export function CustomEventsTable() {
    const { fallback, fallbackSchedules } = useFallbackStore();

    const [customEvents, setCustomEvents] = useState(
        fallback
            ? fallbackSchedules.at(AppStore.getCurrentScheduleIndex())?.customEvents
            : AppStore.schedule.getCurrentCustomEvents()
    );

    useEffect(() => {
        const handleCustomEventsChange = () => {
            setCustomEvents([...AppStore.schedule.getCurrentCustomEvents()]);
        };

        AppStore.on('customEventsChange', handleCustomEventsChange);
        AppStore.on('currentScheduleIndexChange', handleCustomEventsChange);

        return () => {
            AppStore.off('customEventsChange', handleCustomEventsChange);
            AppStore.off('currentScheduleIndexChange', handleCustomEventsChange);
        };
    }, []);

    if (!customEvents?.length) {
        return null;
    }

    return (
        <Box>
            <Typography variant="h6">Custom Events</Typography>
            <Box display="flex" flexDirection="column" gap={1}>
                {customEvents.map((customEvent) => {
                    return (
                        <Box key={customEvent.title}>
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
