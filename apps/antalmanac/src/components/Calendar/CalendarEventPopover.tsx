'use client';

import { Popover } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { shallow } from 'zustand/shallow';

import { CourseCalendarEvent, isSkeletonEvent } from '$components/Calendar/CourseCalendarEvent';
import AppStore from '$stores/AppStore';
import { useSelectedEventStore } from '$stores/SelectedEventStore';

export function CalendarEventPopover() {
    const [anchorEl, selectedEvent, setSelectedEvent] = useSelectedEventStore(
        (state) => [state.selectedEventAnchorEl, state.selectedEvent, state.setSelectedEvent],
        shallow
    );

    const [scheduleNames, setScheduleNames] = useState(() => AppStore.getScheduleNames());

    const handleClosePopover = useCallback(() => {
        setSelectedEvent(null, null);
    }, [setSelectedEvent]);

    useEffect(() => {
        const updateScheduleNames = () => {
            setScheduleNames(AppStore.getScheduleNames());
        };

        AppStore.on('scheduleNamesChange', updateScheduleNames);

        return () => {
            AppStore.off('scheduleNamesChange', updateScheduleNames);
        };
    }, []);

    if (!selectedEvent || isSkeletonEvent(selectedEvent)) {
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
