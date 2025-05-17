import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { useMediaQuery, useTheme, Stack } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import Split from 'react-split';

import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import { Header } from '$components/Header/Header';
import { HelpMenu } from '$components/HelpMenu/HelpMenu';
import InstallPWABanner from '$components/InstallPWABanner';
import { NotificationSnackbar } from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { BLUE } from '$src/globals';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';

function MobileHome() {
    return (
        <Stack component="main" height="100dvh">
            <Header />
            <ScheduleManagement />
        </Stack>
    );
}

function DesktopHome() {
    const setScheduleManagementWidth = useScheduleManagementStore((state) => state.setScheduleManagementWidth);

    const scheduleManagementRef = useRef<HTMLDivElement>(null);

    const handleDrag = useCallback(() => {
        const scheduleManagementElement = scheduleManagementRef.current;
        if (!scheduleManagementElement) {
            return;
        }

        const elementWidth = scheduleManagementElement.getBoundingClientRect().width;
        setScheduleManagementWidth(elementWidth);
    }, [setScheduleManagementWidth]);

    useEffect(() => {
        handleDrag();

        window.addEventListener('resize', handleDrag);

        return () => {
            window.removeEventListener('resize', handleDrag);
        };
    }, [handleDrag]);

    return (
        <>
            <Stack height="100dvh">
                <Header />

                <Split
                    sizes={[45, 55]}
                    minSize={400}
                    expandToMin={false}
                    gutterSize={10}
                    gutterAlign="center"
                    snapOffset={30}
                    dragInterval={1}
                    direction="horizontal"
                    cursor="col-resize"
                    style={{ display: 'flex', flexGrow: 1, marginTop: 4 }}
                    gutterStyle={() => ({
                        backgroundColor: BLUE,
                        width: '10px',
                        // gutter contents are slightly offset to the right, this centers the content
                        paddingRight: '1px',
                    })}
                    onDrag={handleDrag}
                >
                    <Stack direction="column">
                        <ScheduleCalendar />
                    </Stack>
                    <Stack direction="column" ref={scheduleManagementRef}>
                        <ScheduleManagement />
                    </Stack>
                </Split>
            </Stack>
        </>
    );
}

export default function Home() {
    const theme = useTheme();

    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <PatchNotes />
            <InstallPWABanner />

            {isMobileScreen ? <MobileHome /> : <DesktopHome />}

            <NotificationSnackbar />
            <HelpMenu />
        </MuiPickersUtilsProvider>
    );
}
