import Split from 'react-split';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@material-ui/core';
import Tour from 'reactour';

import { useCallback } from 'react';
import Header from '$components/Header';
import MobileHome from '$components/MobileHome';
import PatchNotes from '$components/PatchNotes';
import Calendar from '$components/Calendar/CalendarRoot';
import DesktopTabs from '$components/RightPane/RightPaneRoot';
import NotificationSnackbar from '$components/NotificationSnackbar';
import { tourSteps, useTourStore } from '$stores/TourStore';

export default function Home() {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    const theme = useTheme();

    const [tourEnabled, disableTour, tourFrozen] = useTourStore((state) => [
        state.tourEnabled,
        state.endTour,
        state.tourFrozen,
    ]);

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils}>
            <CssBaseline />
            <PatchNotes />
            <Header />
            {isMobileScreen ? (
                <MobileHome />
            ) : (
                <>
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
                    <Tour
                        steps={tourSteps}
                        isOpen={tourEnabled}
                        showButtons={!tourFrozen}
                        disableKeyboardNavigation={tourFrozen}
                        showNavigationNumber={false}
                        disableFocusLock={true}
                        rounded={5}
                        closeWithMask={false}
                        onRequestClose={disableTour}
                        maskSpace={5}
                    />
                </>
            )}
            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}
