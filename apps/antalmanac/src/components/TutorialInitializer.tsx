import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { useTour } from '@reactour/tour';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function TutorialInitializer() {
    const navigate = useNavigate();
    const { setSteps, setCurrentStep, setIsOpen } = useTour();

    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) {
            return;
        }

        setSteps(stepsFactory(setCurrentStep, navigate));

        if (tourShouldRun()) {
            setIsOpen(true);
        }
    }, [navigate, setCurrentStep, setSteps, setIsOpen]);

    return null;
}
