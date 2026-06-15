import { useGoToTab } from '$lib/tabs/hooks';
import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { useTour } from '@reactour/tour';
import { useEffect } from 'react';

export function TutorialInitializer() {
    const goToTab = useGoToTab();
    const { setSteps, setCurrentStep, setIsOpen } = useTour();

    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) {
            return;
        }

        setSteps(stepsFactory(setCurrentStep, goToTab));

        if (tourShouldRun()) {
            setIsOpen(true);
        }
    }, [goToTab, setCurrentStep, setSteps, setIsOpen]);

    return null;
}
