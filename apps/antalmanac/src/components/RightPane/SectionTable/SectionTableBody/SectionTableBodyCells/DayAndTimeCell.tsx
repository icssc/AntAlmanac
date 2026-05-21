import { TableBodyCellContainer } from '$components/RightPane/SectionTable/SectionTableBody/SectionTableBodyCells/TableBodyCellContainer';
import { formatTimes } from '$stores/calendarizeHelpers';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { Box } from '@mui/material';
import { WebsocSectionMeeting } from '@packages/anteater-api/types';

interface DayAndTimeCellProps {
    meetings: WebsocSectionMeeting[];
}

function getMeetingKey(meeting: WebsocSectionMeeting, meetingIndex: number): string {
    return `${meetingIndex}-${meeting.days}-${meeting.startTime ?? 'tba'}-${meeting.endTime ?? 'tba'}-${meeting.bldg.join(',')}`;
}

export const DayAndTimeCell = ({ meetings }: DayAndTimeCellProps) => {
    const isMilitaryTime = useTimeFormatStore((store) => store.isMilitaryTime);

    return (
        <TableBodyCellContainer>
            {meetings.map((meeting, meetingIndex) => {
                const key = getMeetingKey(meeting, meetingIndex);

                if (meeting.timeIsTBA) {
                    return <Box key={key}>TBA</Box>;
                }

                if (meeting.startTime && meeting.endTime) {
                    const timeString = formatTimes(meeting.startTime, meeting.endTime, isMilitaryTime);

                    return <Box key={key}>{`${meeting.days} ${timeString}`}</Box>;
                }

                return null;
            })}
        </TableBodyCellContainer>
    );
};
