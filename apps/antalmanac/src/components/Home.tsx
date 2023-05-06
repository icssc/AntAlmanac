import DateFnsUtils from '@date-io/date-fns';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@material-ui/core';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import Split from 'react-split';

import Bar from './AppBar/CustomAppBar';
import NotificationSnackbar from './AppBar/NotificationSnackbar';
import Calendar from './Calendar/CalendarRoot';
import MobileHome from './MobileHome';
import PatchNotes from './PatchNotes';
import DesktopTabs from './RightPane/RightPaneRoot';

const Home = () => {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    const theme = useTheme();

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />
            <PatchNotes />
            <Bar />
            {isMobileScreen ? (
                <MobileHome />
            ) : (
                <Split
                    sizes={[50, 50]}
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
};

export default Home;
