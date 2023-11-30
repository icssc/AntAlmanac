import Split from 'react-split';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@material-ui/core';

import Header from '$components/Header';
import MobileHome from '$components/MobileHome';
import PatchNotes from '$components/PatchNotes';
import Calendar from '$components/Calendar/CalendarRoot';
import DesktopTabs from '$components/RightPane/RightPaneRoot';
import NotificationSnackbar from '$components/NotificationSnackbar';

export default function Home() {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    const theme = useTheme();

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />
            <PatchNotes />
            <Header />
            {isMobileScreen ? (
                <MobileHome />
            ) : (
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

                    <Box>
                        <DesktopTabs style={{ height: 'calc(100vh - 58px)' }} />
                    </Box>
                </Split>
            )}
            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}
