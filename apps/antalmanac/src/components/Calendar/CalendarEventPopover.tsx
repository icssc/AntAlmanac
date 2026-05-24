'use client';

import { CourseCalendarEvent, isSkeletonEvent } from '$components/Calendar/CourseCalendarEvent';
import { useScheduleViewSource } from '$lib/schedule/ScheduleViewContext';
import { useSelectedEventStore } from '$stores/SelectedEventStore';
import { Popover } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function CalendarEventPopover() {
    const scheduleSource = useScheduleViewSource();
    const [anchorEl, selectedEvent, selectedEventScope, setSelectedEvent] = useSelectedEventStore(
        useShallow((state) => [
            state.selectedEventAnchorEl,
            state.selectedEvent,
            state.selectedEventScope,
            state.setSelectedEvent,
        ])
    );

    const [scheduleNames, setScheduleNames] = useState(() => scheduleSource.getScheduleNames());

    const handleClosePopover = useCallback(() => {
        setSelectedEvent(null, null);
    }, [setSelectedEvent]);

    useEffect(() => {
        const updateScheduleNames = () => {
            setScheduleNames(scheduleSource.getScheduleNames());
        };

        updateScheduleNames();
        return scheduleSource.subscribe(updateScheduleNames);
    }, [scheduleSource]);

    if (!selectedEvent || isSkeletonEvent(selectedEvent) || selectedEventScope !== scheduleSource.scope) {
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
