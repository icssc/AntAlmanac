import { Popover } from '@mui/material';
import { useCallback } from 'react';

import CourseCalendarEvent from '$components/Calendar/CalendarEventPopoverContent';
import { useSelectedEventStore } from '$stores/SelectedEventStore';

export function CalendarEventPopover() {
    const { selectedEventAnchorEl: anchorEl, selectedEvent, setSelectedEvent } = useSelectedEventStore();

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
            <CourseCalendarEvent closePopover={handleClosePopover} selectedEvent={selectedEvent} />
        </Popover>
    );
}
