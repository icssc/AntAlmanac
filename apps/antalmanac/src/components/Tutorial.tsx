import ReplayIcon from '@mui/icons-material/Replay';
import { Fab, Tooltip, IconButton } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useEffect, useMemo } from 'react';

import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { removeSampleClasses } from '$lib/tourExampleGeneration';
import { useCoursePaneStore } from '$stores/CoursePaneStore';

export function Tutorial({ onClick, onDismiss }: { onClick?: () => void; onDismiss?: () => void }) {
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
        if (onDismiss) onDismiss(); 
    }, [isOpen, onDismiss]);

    // The steps need to be generated here, in the component, because Reactour hooks can only be used in components.
    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) return;
        setSteps(stepsFactory(setCurrentStep));
    }, [setCurrentStep, setSteps]);

    /** Floating action button (FAB) in the bottom right corner to reactivate the tutorial */
    return (
        <Tooltip title="Restart tutorial">
            <IconButton
                color="primary"
                onClick={() => restartTour()}
                size="large"
                sx={{
                    backgroundColor: '#fff',
                    ':hover': { backgroundColor: '#e0f7fa', 
                        boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.2)', 
                     },
                    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.6)',
                }}
            >
                <ReplayIcon />
            </IconButton>
        </Tooltip>
    );
}
