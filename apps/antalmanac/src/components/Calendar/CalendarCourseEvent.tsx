import { Box } from '@material-ui/core';
import { memo } from 'react';
import { shallow } from 'zustand/shallow';

import { CalendarEvent } from '$components/Calendar/CourseCalendarEvent';
import locationIds from '$lib/locations/locations';
import { useSelectedEventStore } from '$stores/SelectedEventStore';

export const CalendarCourseEvent = memo(({ event }: { event: CalendarEvent }) => {
    const setSelectedEvent = useSelectedEventStore((state) => state.setSelectedEvent, shallow);

    const handleClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        setSelectedEvent(e, event);
    };

    if (event.isCustomEvent) {
        return (
            <Box onClick={handleClick}>
                <Box
                    style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-between',
                        fontWeight: 500,
                        fontSize: '0.8rem',
                    }}
                >
                    <Box>{event.title}</Box>
                </Box>

                <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                    <Box>{Object.keys(locationIds).find((key) => locationIds[key] === parseInt(event.building))}</Box>
                </Box>
            </Box>
        );
    }

    return (
        <Box onClick={handleClick}>
            <Box
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                }}
            >
                <Box>{event.title}</Box>
                <Box style={{ fontSize: '0.8rem' }}> {event.sectionType}</Box>
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <Box>
                    {event.showLocationInfo
                        ? event.locations.map((location) => `${location.building} ${location.room}`).join(', ')
                        : event.locations.length > 1
                          ? `${event.locations.length} Locations`
                          : `${event.locations[0].building} ${event.locations[0].room}`}
                </Box>
                <Box>{event.sectionCode}</Box>
            </Box>
        </Box>
    );
});

CalendarCourseEvent.displayName = 'CalendarCourseEvent';
