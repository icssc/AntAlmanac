import { Box } from '@mui/material';

import { CourseEventProps } from '$components/Calendar/CalendarEventPopoverContent';

interface CalendarCourseEventProps {
    event: CourseEventProps;
    handleClick: (e: React.MouseEvent) => void;
}

export const CalendarCourseEvent = ({ event, handleClick }: CalendarCourseEventProps) => {
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
};
