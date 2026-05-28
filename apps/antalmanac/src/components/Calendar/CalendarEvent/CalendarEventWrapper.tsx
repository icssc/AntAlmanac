'use client';

import type { CalendarEvent, CourseEvent } from '$components/Calendar/types';
import { isSkeletonEvent } from '$components/Calendar/types';
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

    const handleClick = useCallback(
        (e: React.MouseEvent) => {
            if (!props.event || isSkeletonEvent(props.event)) {
                return;
            }

            e.preventDefault();
            e.stopPropagation();

            if (!props.event.isCustomEvent && (e.metaKey || e.ctrlKey)) {
                const courseInfo = props.event as CourseEvent;
                quickSearch(courseInfo.deptValue, courseInfo.courseNumber, courseInfo.term);
            } else {
                setSelectedEvent(e, props.event);
            }
        },
        [props.event, quickSearch, setSelectedEvent]
    );

    return <div>{isValidElement(children) ? cloneElement(children, { onClick: handleClick }) : children}</div>;
});
