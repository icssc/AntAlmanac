import { Box } from '@mui/material';
import type { WebsocSectionMeeting } from '@packages/antalmanac-types';

import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { formatTimes } from '$stores/calendarizeHelpers';

interface DayAndTimeCellProps {
    meetings: WebsocSectionMeeting[];
}

export const DayAndTimeCell = ({ meetings }: DayAndTimeCellProps) => {
    const { isMilitaryTime } = useTimeFormatStore();

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
