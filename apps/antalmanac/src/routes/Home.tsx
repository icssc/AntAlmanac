import DateFnsUtils from '@date-io/date-fns';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
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

            <Stack component="main" height="100%">
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
                style={{ display: 'flex' }}
                gutterStyle={() => ({
                    backgroundColor: theme.palette.primary.main,
                    width: '10px',
                })}
            >
                <Box>
                    <Calendar isMobile={false} />
                </Box>
                <Stack width="100%" height="calc(100vh - 58px)">
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
