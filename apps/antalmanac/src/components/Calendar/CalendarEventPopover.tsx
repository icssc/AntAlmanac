'use client';

import { CourseCalendarEvent, isSkeletonEvent } from '$components/Calendar/CourseCalendarEvent';
import { useSelectedEventStore } from '$stores/SelectedEventStore';
import { Popover } from '@mui/material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface CalendarEventPopoverProps {
    scheduleNames: string[];
}

export function CalendarEventPopover({ scheduleNames }: CalendarEventPopoverProps) {
    const [anchorEl, selectedEvent, setSelectedEvent] = useSelectedEventStore(
        useShallow((state) => [state.selectedEventAnchorEl, state.selectedEvent, state.setSelectedEvent])
    );

    const handleClosePopover = useCallback(() => {
        setSelectedEvent(null, null);
    }, [setSelectedEvent]);

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
