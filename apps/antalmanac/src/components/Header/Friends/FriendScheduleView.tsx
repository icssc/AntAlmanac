import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { FriendSchedule } from '$components/RightPane/AddedCourses/FriendSchedule';
import { useIsMobile } from '$hooks/useIsMobile';
import { BLUE } from '$src/globals';
import { Stack } from '@mui/material';
import Split from 'react-split';

function FriendScheduleDesktopView() {
    return (
        <Split
            sizes={[42.5, 57.5]}
            minSize={400}
            expandToMin={false}
            gutterSize={10}
            gutterAlign="center"
            snapOffset={0}
            dragInterval={1}
            direction="horizontal"
            cursor="col-resize"
            style={{ display: 'flex', flexGrow: 1, marginTop: 4 }}
            gutterStyle={() => ({
                backgroundColor: BLUE,
                width: '10px',
                paddingRight: '1px',
            })}
        >
            <Stack direction="column">
                <ScheduleCalendar />
            </Stack>
            <Stack direction="column" flexGrow={1} minHeight={0} overflow="hidden">
                <FriendSchedule />
            </Stack>
        </Split>
    );
}

function FriendScheduleMobileView() {
    return (
        <Stack direction="column" flexGrow={1} height="0" gap={1}>
            <ScheduleCalendar />
            <Stack direction="column" flexGrow={1} minHeight={0} overflow="hidden">
                <FriendSchedule />
            </Stack>
        </Stack>
    );
}

export function FriendScheduleView() {
    const isMobile = useIsMobile();
    return isMobile ? <FriendScheduleMobileView /> : <FriendScheduleDesktopView />;
}
