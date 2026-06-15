import { getTabHref, type TabName } from '$lib/tabs/tabs';
import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { useTour } from '@reactour/tour';
import { useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function TutorialInitializer() {
    const navigate = useNavigate();
    const { setSteps, setCurrentStep, setIsOpen } = useTour();

    const goToTab = useCallback(
        (name: TabName) => {
            navigate(getTabHref(name));
        },
        [navigate]
    );

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
