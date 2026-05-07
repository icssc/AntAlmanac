import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { useTour } from '@reactour/tour';
import { useEffect } from 'react';

export function TutorialInitializer() {
    const { setSteps, setCurrentStep, setIsOpen } = useTour();

    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) {
            return;
        }

        setSteps(stepsFactory(setCurrentStep));

        if (tourShouldRun()) {
            setIsOpen(true);
        }
    }, [setCurrentStep, setSteps, setIsOpen]);

    return null;
}
