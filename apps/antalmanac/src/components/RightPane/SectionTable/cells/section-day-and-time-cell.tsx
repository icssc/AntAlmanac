import { Box } from '@material-ui/core';
import { WebsocSectionMeeting } from '@packages/antalmanac-types';

import { SectionTableCell } from '$components/RightPane/SectionTable/cells/section-table-cell';
import { useTimeFormatStore } from '$stores/SettingsStore';
import { formatTimes } from '$stores/calendarizeHelpers';

interface SectionDayAndTimeCellProps {
    meetings: WebsocSectionMeeting[];
}

export function SectionDayAndTimeCell({ meetings }: SectionDayAndTimeCellProps) {
    const { isMilitaryTime } = useTimeFormatStore();

    return (
        <SectionTableCell>
            {meetings.map((meeting) => {
                if (meeting.timeIsTBA) {
                    return <Box key={meeting.timeIsTBA.toString()}>TBA</Box>;
                }

                if (meeting.startTime && meeting.endTime) {
                    const timeString = formatTimes(meeting.startTime, meeting.endTime, isMilitaryTime);

                    return <Box key={meeting.timeIsTBA + meeting.bldg[0]}>{`${meeting.days} ${timeString}`}</Box>;
                }
            })}
        </SectionTableCell>
    );
}
