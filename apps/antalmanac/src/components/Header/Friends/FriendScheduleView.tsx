import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { FriendSchedule } from '$components/RightPane/AddedCourses/FriendSchedule';
import { useIsMobile } from '$hooks/useIsMobile';
import { FriendScheduleTabProvider, type FriendScheduleTab } from '$lib/schedule/FriendScheduleTabContext';
import { BLUE } from '$src/globals';
import { Box, Stack } from '@mui/material';
import { useCallback, useState } from 'react';
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
            style={{ display: 'flex', flex: 1, height: '100%', minHeight: 0, marginTop: 4 }}
            gutterStyle={() => ({
                backgroundColor: BLUE,
                width: '10px',
                paddingRight: '1px',
            })}
        >
            <Stack direction="column" height="100%" minHeight={0} overflow="hidden">
                <ScheduleCalendar />
            </Stack>
            <Stack direction="column" height="100%" minHeight={0} overflow="hidden">
                <FriendSchedule />
            </Stack>
        </Split>
    );
}

function FriendScheduleMobileView() {
    return (
        <Stack direction="column" flexGrow={1} height={0} minHeight={0} gap={1} overflow="hidden">
            <ScheduleCalendar />
            <Stack direction="column" flexGrow={1} height={0} minHeight={0} overflow="hidden">
                <FriendSchedule />
            </Stack>
        </Stack>
    );
}

export function FriendScheduleView() {
    const isMobile = useIsMobile();
    const [activeTab, setActiveTab] = useState<FriendScheduleTab>('added');
    const [mapLocationId, setMapLocationId] = useState<number | undefined>();

    const focusMapLocation = useCallback((buildingId: number) => {
        setMapLocationId(buildingId);
        setActiveTab('map');
    }, []);

    return (
        <FriendScheduleTabProvider
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            mapLocationId={mapLocationId}
            setMapLocationId={setMapLocationId}
            focusMapLocation={focusMapLocation}
        >
            <Box
                sx={{
                    flexGrow: 1,
                    height: 0,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {isMobile ? <FriendScheduleMobileView /> : <FriendScheduleDesktopView />}
            </Box>
        </FriendScheduleTabProvider>
    );
}
