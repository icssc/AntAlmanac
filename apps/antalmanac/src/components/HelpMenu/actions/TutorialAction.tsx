import { PlayLesson } from '@mui/icons-material';
import { useTour } from '@reactour/tour';
import { useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { removeSampleClasses } from '$lib/tourExampleGeneration';
import { useCoursePaneStore } from '$stores/CoursePaneStore';

export function TutorialAction() {
    const { setCurrentStep, setIsOpen, setSteps, isOpen } = useTour();
    const [displaySearch, disableManualSearch] = useCoursePaneStore(
        useShallow((state) => [state.displaySearch, state.disableManualSearch])
    );

    const handleClick = useCallback(() => {
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

    return { icon: <PlayLesson />, name: 'Start Tutorial', onClick: handleClick };
}
