import { memo, useCallback } from 'react';

import { CalendarCourseEvent } from '$components/Calendar/CalendarCourseEvent';
import { CalendarCustomEvent } from '$components/Calendar/CalendarCustomEvent';
import { CalendarEventProps } from '$components/Calendar/CalendarEventPopoverContent';
import { useSelectedEventStore } from '$stores/SelectedEventStore';

export const CalendarEvent = memo(({ event }: { event: CalendarEventProps }) => {
    const { setSelectedEvent } = useSelectedEventStore();

    const handleClick = useCallback((e: React.MouseEvent) => {
        setSelectedEvent(e, event);
    }, []);

    if (event.isCustomEvent) {
        return <CalendarCustomEvent event={event} handleClick={handleClick} />;
    }

    return <CalendarCourseEvent event={event} handleClick={handleClick} />;
});

CalendarEvent.displayName = 'CalendarEvent';
