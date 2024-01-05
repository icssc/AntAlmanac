import { useEffect, useState } from 'react';
import Reactour from 'reactour';
import useTourStore from '$stores/TourStore';

export default function Tour() {
    const [tourEnabled, disableTour] = useTourStore((state) => [state.tourEnabled, state.endTour]);

    const [tourSteps, step, setStep] = useTourStore((state) => [state.tourSteps, state.step, state.setStep]);

    const [updater, setUpdater] = useState(0);

    // Force component to re-render when the step changes. Idk why it doesn't *React* normally otherwise.
    useEffect(() => setUpdater(updater + 1), [step]);

    return (
        <Reactour
            steps={tourSteps}
            goToStep={step}
            getCurrentStep={setStep}
            isOpen={tourEnabled}
            showNavigationNumber={true}
            disableFocusLock={true}
            rounded={5}
            closeWithMask={false}
            onRequestClose={disableTour}
            maskSpace={5}
        />
    );
}
