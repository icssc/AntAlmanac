import { stepsFactory, tourShouldRun } from '$lib/TutorialHelpers';
import { useTour } from '@reactour/tour';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function TutorialInitializer() {
    const router = useRouter();
    const { setSteps, setCurrentStep, setIsOpen } = useTour();

    useEffect(() => {
        if (setSteps == null || setCurrentStep == null) {
            return;
        }

        setSteps(stepsFactory(setCurrentStep, (path) => router.push(path)));

        if (tourShouldRun()) {
            setIsOpen(true);
        }
    }, [router, setCurrentStep, setSteps, setIsOpen]);

    return null;
}
