import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { formatTimes } from '$stores/calendarizeHelpers';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { Box } from '@mui/material';
import type { AASection } from '@packages/antalmanac-types';

interface DayAndTimeCellProps {
    section: AASection;
}

export const DayAndTimeCell = ({ section }: DayAndTimeCellProps) => {
    const { meetings } = section;
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);

    return (
        <TableBodyCellContainer>
            {meetings.map((meeting) => {
                if (meeting.timeIsTBA) {
                    return <Box key={meeting.timeIsTBA.toString()}>TBA</Box>;
                }

                if (meeting.startTime && meeting.endTime) {
                    const timeString = formatTimes(meeting.startTime, meeting.endTime, isMilitaryTime);

                    return <Box key={meeting.timeIsTBA + meeting.bldg[0]}>{`${meeting.days} ${timeString}`}</Box>;
                }
            })}
        </TableBodyCellContainer>
    );
};
