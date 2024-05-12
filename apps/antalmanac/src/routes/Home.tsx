import DateFnsUtils from '@date-io/date-fns';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Split from 'react-split';

import Calendar from '$components/Calendar/CalendarRoot';
import Header from '$components/Header';
import NotificationSnackbar from '$components/NotificationSnackbar';
import PatchNotes from '$components/PatchNotes';
import SharedTabs from '$components/SharedRoot';
import { Tutorial } from '$components/Tutorial';

export default function Home() {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    const theme = useTheme();

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />
            <PatchNotes />
            <Header />

            {isMobileScreen ? (
                <SharedTabs mobile={true} />
            ) : (
                <>
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

                        <SharedTabs mobile={false} />
                    </Split>
                    <Tutorial />
                </>
            )}
            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}
