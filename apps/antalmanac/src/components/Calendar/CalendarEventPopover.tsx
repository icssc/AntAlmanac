import { Popover } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import CourseCalendarEvent from '$components/Calendar/CourseCalendarEvent';
import { useScheduleStore } from '$stores/ScheduleStore';
import { useSelectedEventStore } from '$stores/SelectedEventStore';

export function CalendarEventPopover() {
    const [anchorEl, selectedEvent, setSelectedEvent] = useSelectedEventStore(
        (state) => [state.selectedEventAnchorEl, state.selectedEvent, state.setSelectedEvent],
        shallow
    );

    const scheduleNames = useScheduleStore((state) => state.getScheduleNames());

    const handleClosePopover = useCallback(() => {
        setSelectedEvent(null, null);
    }, [setSelectedEvent]);

    if (!selectedEvent) {
        return null;
    }

    return (
        <Popover
            anchorEl={anchorEl}
            open={Boolean(anchorEl) && !!selectedEvent}
            onClose={handleClosePopover}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'right',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >
            <CourseCalendarEvent
                closePopover={handleClosePopover}
                selectedEvent={selectedEvent}
                scheduleNames={scheduleNames}
            />
        </Popover>
    );
}
