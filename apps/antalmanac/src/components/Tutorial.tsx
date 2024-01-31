import ReplayIcon from '@mui/icons-material/Replay';
import { Fab, Tooltip } from '@mui/material';

import { useTour } from '@reactour/tour';

import { useEffect, useMemo } from 'react';
import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import useCoursePaneStore from '$stores/CoursePaneStore';
import { removeSampleClasses } from '$lib/tourExampleGeneration';

export function Tutorial() {
    const { setCurrentStep, setIsOpen, setSteps, isOpen } = useTour();
    const [displaySearch, disableManualSearch] = useCoursePaneStore((state) => [
        state.displaySearch,
        state.disableManualSearch,
    ]);

    const restartTour = useMemo(
        () => () => {
            displaySearch();
            disableManualSearch();
            setCurrentStep(0);
            setIsOpen(true);
        },
        [displaySearch, disableManualSearch, setCurrentStep, setIsOpen]
    );

    useEffect(() => setIsOpen(tourShouldRun), [setIsOpen]);

    // Remove sample classes when the tour is closed.
    useEffect(() => {
        if (isOpen) return;
        removeSampleClasses();
    }, [isOpen]);

    // The steps need to be generated here, in the component, because Reactour hooks can only be used in components.
    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) return;
        setSteps(stepsFactory(setCurrentStep));
    }, [setCurrentStep, setSteps]);

    /** Floating action button (FAB) in the bottom right corner to reactivate the tutorial */
    return (
        <Tooltip title="Restart tutorial">
            <Fab
                id="tutorial-floater"
                color="primary"
                aria-label="Restart tutorial"
                onClick={() => restartTour()}
                style={{
                    position: 'fixed',
                    bottom: '1rem',
                    right: '1rem',
                    zIndex: 999,
                    opacity: 0.5,
                    width: '4rem',
                    height: '4rem',
                }}
            >
                <ReplayIcon />
            </Fab>
        </Tooltip>
    );
}
