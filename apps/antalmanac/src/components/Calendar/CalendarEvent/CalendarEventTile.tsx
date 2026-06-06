import type { CalendarEvent, Location } from '$components/Calendar/types';
import { isCustomEvent, isSkeletonEvent } from '$components/Calendar/types';
import { buildingCodeFromLocationNumericId } from '$lib/locations/locations';
import { Box } from '@mui/material';
import { memo } from 'react';

export const CalendarEventTile = memo(({ event }: { event: CalendarEvent }) => {
    if (isSkeletonEvent(event)) {
        return null;
    }

    if (isCustomEvent(event)) {
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
                    <Box>{buildingCodeFromLocationNumericId(parseInt(event.building, 10))}</Box>
                </Box>
            </Box>
        );
    }

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
                <Box style={{ fontSize: '0.8rem' }}> {event.sectionType}</Box>
            </Box>
            <Box style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', fontSize: '0.7rem' }}>
                <Box>
                    {event.showLocationInfo
                        ? event.locations
                              .map((location: Location) => `${location.building} ${location.room}`)
                              .join(', ')
                        : event.locations.length > 1
                          ? `${event.locations.length} Locations`
                          : `${event.locations[0].building} ${event.locations[0].room}`}
                </Box>
                <Box>{event.sectionCode}</Box>
            </Box>
        </Box>
    );
});

CalendarEventTile.displayName = 'CalendarEventTile';
