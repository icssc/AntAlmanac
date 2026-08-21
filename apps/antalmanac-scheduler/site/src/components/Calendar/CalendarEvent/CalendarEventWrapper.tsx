'use client';

import { type CalendarEvent, isCourseEvent, isSkeletonEvent } from '$components/Calendar/types';
import { useQuickSearch } from '$hooks/useQuickSearch';
import { useSelectedEventStore } from '$stores/SelectedEventStore';
import { cloneElement, isValidElement, memo, useCallback } from 'react';
import type { EventWrapperProps } from 'react-big-calendar';

interface CalendarEventWrapperProps extends EventWrapperProps<CalendarEvent> {
    children?: React.ReactElement<{ onClick: (e: React.MouseEvent) => void }>;
}

/**
 * CalendarEventWrapper allows us to override the default onClick event behavior which problematically rerenders the entire calendar.
 */
export const CalendarEventWrapper = memo(function CalendarEventWrapper({
    children,
    ...props
}: CalendarEventWrapperProps) {
    const quickSearch = useQuickSearch();

    const setSelectedEvent = useSelectedEventStore((state) => state.setSelectedEvent);
    const isSelected = useSelectedEventStore((state) => state.selectedEvent === props.event);

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!props.event || isSkeletonEvent(props.event)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (isCourseEvent(props.event) && (e.metaKey || e.ctrlKey)) {
                quickSearch(props.event.deptValue, props.event.courseNumber, props.event.term);
            } else {
                setSelectedEvent(e, props.event);
            }
        },
        [props.event, quickSearch, setSelectedEvent]
    );

    return (
        <div style={isSelected ? { zIndex: 10 } : undefined}>
            {isValidElement(children) ? cloneElement(children, { onClick: handleClick }) : children}
        </div>
    );
});
