import { PlayLesson } from '@mui/icons-material';
import { useTour } from '@reactour/tour';
import { useCallback, useEffect } from 'react';

import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { removeSampleClasses } from '$lib/tourExampleGeneration';
import { useCoursePaneStore } from '$stores/CoursePaneStore';

export function TutorialAction() {
    const { setCurrentStep, setIsOpen, setSteps, isOpen } = useTour();
    const [displaySearch, disableManualSearch] = useCoursePaneStore((state) => [
        state.displaySearch,
        state.disableManualSearch,
    ]);

    const startTour = useCallback(() => {
        displaySearch();
        disableManualSearch();
        setCurrentStep(0);
        setIsOpen(true);
    }, [displaySearch, disableManualSearch, setCurrentStep, setIsOpen]);

    useEffect(() => setIsOpen(tourShouldRun), [setIsOpen]);

    // Remove sample classes when the tour is closed.
    useEffect(() => {
        return () => {
            removeSampleClasses();
        };
    }, [isOpen]);

    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) {
            return;
        }

        setSteps(stepsFactory(setCurrentStep));
    }, [setCurrentStep, setSteps]);

    return { icon: <PlayLesson />, name: 'Start Tutorial', onClick: startTour };
}
