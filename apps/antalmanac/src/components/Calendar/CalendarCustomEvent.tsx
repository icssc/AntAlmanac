import { CustomEventProps } from '$components/Calendar/CalendarEventPopoverContent';
import locationIds from '$lib/location_ids';
import { Box } from '@mui/material';

interface CalendarCustomEventProps {
    event: CustomEventProps;
    handleClick: (e: React.MouseEvent) => void;
}

export const CalendarCustomEvent = ({ event, handleClick }: CalendarCustomEventProps) => {
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
};
