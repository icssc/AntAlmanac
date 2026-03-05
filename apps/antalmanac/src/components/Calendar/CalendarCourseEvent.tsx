import { Box } from '@mui/material';
import { memo } from 'react';

import type { CalendarEvent, CourseEvent, Location } from '$components/Calendar/CourseCalendarEvent';
import { isSkeletonEvent } from '$components/Calendar/CourseCalendarEvent';
import locationIds from '$lib/locations/locations';

export const CalendarCourseEvent = memo(({ event }: { event: CalendarEvent }) => {
    if (isSkeletonEvent(event)) {
        return;
    }

    if (event.isCustomEvent) {
        return (
            <Box>
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

    const courseEvent = event as CourseEvent;
    return (
        <Box>
            <Box
                style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'space-between',
                    fontWeight: 500,
                    fontSize: '0.8rem',
                }}
            >
                <Box>{courseEvent.title}</Box>
                <Box style={{ fontSize: '0.8rem' }}> {courseEvent.sectionType}</Box>
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <Box>
                    {courseEvent.showLocationInfo
                        ? courseEvent.locations
                              .map((location: Location) => `${location.building} ${location.room}`)
                              .join(', ')
                        : courseEvent.locations.length > 1
                        ? `${courseEvent.locations.length} Locations`
                        : `${courseEvent.locations[0].building} ${courseEvent.locations[0].room}`}
                </Box>
                <Box>{courseEvent.sectionCode}</Box>
            </Box>
        </Box>
    );
});

CalendarCourseEvent.displayName = 'CalendarCourseEvent';
