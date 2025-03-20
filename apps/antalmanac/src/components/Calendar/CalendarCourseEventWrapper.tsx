import { Box } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import { EventWrapperProps } from 'react-big-calendar';
import { useShallow } from 'zustand/react/shallow';

import type { CalendarEvent } from '$components/Calendar/CourseCalendarEvent';
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
            e.preventDefault();
            e.stopPropagation();

            if (props.event && !props.event.isCustomEvent && (e.metaKey || e.ctrlKey)) {
                const courseInfo = props.event;
                quickSearch(courseInfo.deptValue, courseInfo.courseNumber, courseInfo.term, courseInfo.sectionCode);
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
