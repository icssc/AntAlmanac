import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { CssBaseline, useMediaQuery, useTheme, Stack } from '@mui/material';
import { useCallback, useEffect, useRef } from 'react';
import Split from 'react-split';
import { useTour } from '@reactour/tour';

import { ScheduleCalendar } from '$components/Calendar/CalendarRoot';
import Header from '$components/Header';
import NotificationSnackbar from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import { ScheduleManagement } from '$components/ScheduleManagement/ScheduleManagement';
import { Tutorial } from '$components/Tutorial';
import { useScheduleManagementStore } from '$stores/ScheduleManagementStore';
import { tourShouldRun, stepsFactory } from '$lib/TutorialHelpers';

function MobileHome() {
    return (
        <Stack component="main" height="100dvh">
            <Header />
            <ScheduleManagement />
        </Stack>
    );
}

function DesktopHome() {
    const theme = useTheme();
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
                    style={{ display: 'flex', flexGrow: 1 }}
                    gutterStyle={() => ({
                        backgroundColor: theme.palette.primary.main,
                        width: '10px',
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

    const { setIsOpen, setCurrentStep, setSteps } = useTour();

    useEffect(() => {
        setSteps(stepsFactory(() => setCurrentStep(0)));

        if (tourShouldRun()) {
            setCurrentStep(0);
            setIsOpen(true);
        }
    }, [setCurrentStep, setIsOpen, setSteps]);

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />

            <PatchNotes />

            {isMobileScreen ? <MobileHome /> : <DesktopHome />}

            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}
