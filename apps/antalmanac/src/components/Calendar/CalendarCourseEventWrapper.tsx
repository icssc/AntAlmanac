"use client";

import type { CalendarEvent, CourseEvent } from "$components/Calendar/CourseCalendarEvent";
import { isSkeletonEvent } from "$components/Calendar/CourseCalendarEvent";
import { useQuickSearch } from "$src/hooks/useQuickSearch";
import { useSelectedEventStore } from "$stores/SelectedEventStore";
import { Box } from "@mui/material";
import { cloneElement, isValidElement, useCallback } from "react";
import { EventWrapperProps } from "react-big-calendar";
import { useShallow } from "zustand/react/shallow";

interface CalendarCourseEventWrapperProps extends EventWrapperProps<CalendarEvent> {
    children?: React.ReactElement<{ onClick: (e: React.MouseEvent) => void }>;
}

/**
 * CalendarCourseEventWrapper allows us to override the default onClick event behavior which problamtically rerenders the entire calendar
 */
export const CalendarCourseEventWrapper = ({
    children,
    ...props
}: CalendarCourseEventWrapperProps) => {
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
        [props.event, quickSearch, setSelectedEvent],
    );

    return (
        <Box>
            {isValidElement(children) ? cloneElement(children, { onClick: handleClick }) : children}
        </Box>
    );
};
