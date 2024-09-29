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

function MobileHome() {
    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />

            <PatchNotes />

            <Stack component="main" height="100dvh">
                <Header />
                <ScheduleManagement />
            </Stack>

            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}

function DesktopHome() {
    const theme = useTheme();

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />

            <PatchNotes />

            <Header />

            <Split
                sizes={[45, 55]}
                minSize={100}
                expandToMin={false}
                gutterSize={10}
                gutterAlign="center"
                snapOffset={30}
                dragInterval={1}
                direction="horizontal"
                cursor="col-resize"
                style={{ display: 'flex', flexGrow: 1, height: '100dvh' }}
                gutterStyle={() => ({
                    backgroundColor: theme.palette.primary.main,
                    width: '10px',
                })}
            >
                <Stack direction="column">
                    <Calendar isMobile={false} />
                </Stack>
                <Stack direction="column">
                    <ScheduleManagement />
                </Stack>
            </Split>

            <Tutorial />

            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}

export default function Home() {
    const theme = useTheme();

    const isMobileScreen = useMediaQuery(theme.breakpoints.down('sm'));

    return isMobileScreen ? <MobileHome /> : <DesktopHome />;
}
