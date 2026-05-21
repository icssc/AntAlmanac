import { CustomEventDetailView } from '$components/RightPane/AddedCourses/CustomEventDetailView';
import { useCurrentCustomEvents } from '$hooks/useAppStoreSchedule';
import AppStore from '$stores/AppStore';
import { Box, Typography } from '@mui/material';
import type { RepeatingCustomEvent } from '@packages/antalmanac-types';

type CustomEventsBoxProps = {
    customEvents?: RepeatingCustomEvent[];
};

export function CustomEventsBox({ customEvents: customEventsProp }: CustomEventsBoxProps) {
    if (customEventsProp !== undefined) {
        return <CustomEventsBoxContent customEvents={customEventsProp} />;
    }

    return <CustomEventsBoxFromStore />;
}

function CustomEventsBoxFromStore() {
    const customEvents = useCurrentCustomEvents();
    return <CustomEventsBoxContent customEvents={customEvents} />;
}

function CustomEventsBoxContent({ customEvents }: { customEvents: RepeatingCustomEvent[] }) {
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
