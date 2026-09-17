'use client';

import { CalendarEventDetail } from '$components/Calendar/CalendarEvent/CalendarEventDetail';
import { isSkeletonEvent } from '$components/Calendar/types';
import { useSelectedEventStore } from '$stores/SelectedEventStore';
import { Popover } from '@mui/material';
import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function CalendarEventPopover() {
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
            <CalendarEventDetail closePopover={handleClosePopover} selectedEvent={selectedEvent} />
        </Popover>
    );
}
