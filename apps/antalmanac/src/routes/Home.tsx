import Split from 'react-split';
import DateFnsUtils from '@date-io/date-fns';
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import { Box, CssBaseline, useMediaQuery, useTheme } from '@material-ui/core';
import Tour from 'reactour';

import { useState, useEffect } from 'react';
import Header from '$components/Header';
import MobileHome from '$components/MobileHome';
import PatchNotes from '$components/PatchNotes';
import Calendar from '$components/Calendar/CalendarRoot';
import DesktopTabs from '$components/RightPane/RightPaneRoot';
import NotificationSnackbar from '$components/NotificationSnackbar';
import { useTourStore } from '$stores/TourStore';
import ReactivateTutorial from '$components/buttons/ReactivateTutorialFAB';

export default function Home() {
    const isMobileScreen = useMediaQuery('(max-width: 750px)');
    const theme = useTheme();

    const [tourEnabled, disableTour] = useTourStore((state) => [state.tourEnabled, state.endTour]);

    const [tourSteps, step, setStep] = useTourStore((state) => [state.tourSteps, state.step, state.setStep]);

    const [updater, setUpdater] = useState(0);

    // Force component to re-render when the step changes. Idk why it doesn't *React* normally otherwise.
    useEffect(() => setUpdater(updater + 1), [step]);

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
                        goToStep={step}
                        getCurrentStep={setStep}
                        isOpen={tourEnabled}
                        showNavigationNumber={false}
                        disableFocusLock={true}
                        rounded={5}
                        closeWithMask={false}
                        onRequestClose={disableTour}
                        maskSpace={5}
                    />
                    <ReactivateTutorial />
                </>
            )}
            <NotificationSnackbar />
        </MuiPickersUtilsProvider>
    );
}
