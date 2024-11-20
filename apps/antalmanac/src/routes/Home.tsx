import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { CssBaseline, useMediaQuery, useTheme } from '@mui/material';
import { Stack } from '@mui/material';
import Split from 'react-split';

import Calendar from '$components/Calendar/CalendarRoot';
import Header from '$components/Header';
import NotificationSnackbar from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import ScheduleManagement from '$components/SharedRoot';
import { Tutorial } from '$components/Tutorial';
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
    const theme = useTheme();
    const setScheduleManagementWidth = useScheduleManagementStore((state) => state.setScheduleManagementWidth);

    const handleDrag = (sizes: number[]) => {
        if (!window.innerWidth) {
            return;
        }

        /**
         * Sizes is a two element array containing the size of each side (in percentages)
         *
         * @example [25, 75]
         */
        const [_, scheduleManagementPercentage] = sizes;
        const scheduleManagementWidth = window.innerWidth * scheduleManagementPercentage * 0.01;

        setScheduleManagementWidth(scheduleManagementWidth);
    };

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
                        <Calendar isMobile={false} />
                    </Stack>
                    <Stack direction="column">
                        <ScheduleManagement />
                    </Stack>
                </Split>
            </Stack>

            <Tutorial />
        </>
    );
}

export default function Home() {
    const theme = useTheme();

    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />

            <PatchNotes />

            {isMobileScreen ? <MobileHome /> : <DesktopHome />}

            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}
