'use client';

import { Box } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import type { EventWrapperProps } from 'react-big-calendar';
import { useShallow } from 'zustand/react/shallow';

import type { CalendarEvent, CourseEvent } from '$components/Calendar/CourseCalendarEvent';
import { isSkeletonEvent } from '$components/Calendar/CourseCalendarEvent';
import { useQuickSearch } from '$src/hooks/useQuickSearch';
import { useSelectedEventStore } from '$stores/SelectedEventStore';

interface CalendarCourseEventWrapperProps extends EventWrapperProps<CalendarEvent> {
    children?: React.ReactNode;
}

/**
 * CalendarCourseEventWrapper allows us to override the default onClick event behavior which problamtically rerenders the entire calendar
 */
export const CalendarCourseEventWrapper = ({ children, ...props }: CalendarCourseEventWrapperProps) => {
    const ref = useRef<HTMLDivElement>(null);
    const quickSearch = useQuickSearch();

    const setSelectedEvent = useSelectedEventStore(useShallow((state) => state.setSelectedEvent));

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

    useEffect(() => {
        const node = ref.current;
        if (!node) {
            return;
        }

        const rbcEvent = node.querySelector('.rbc-event') as HTMLDivElement;
        if (!rbcEvent) {
            return;
        }

        rbcEvent.onclick = (e) => handleClick(e as unknown as React.MouseEvent); // the native onclick requires a little type hacking
    }, [handleClick]);

    return <Box ref={ref}>{children}</Box>;
};
