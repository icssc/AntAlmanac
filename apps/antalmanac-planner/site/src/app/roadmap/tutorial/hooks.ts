import { useTour } from '@reactour/tour';
import { useCallback, useEffect } from 'react';

import { type TourStepName, stepIndex, waitForRemoval, waitForStableRect } from './tutorialConfig';
import { type AdvanceOn, resolveStep } from './TutorialPopover';

export function useGoToStep() {
    const { setCurrentStep } = useTour();
    return useCallback((name: TourStepName) => setCurrentStep(stepIndex(name)), [setCurrentStep]);
}

/**
 * Advances the tour when the user clicks `advanceOn.click`, once the page has caught up. The
 * listener is delegated, so it survives the clicked element re-rendering.
 */
export function useAdvanceOn(advanceOn: AdvanceOn | undefined) {
    const goTo = useGoToStep();
    const { setIsOpen } = useTour();

    useEffect(() => {
        if (!advanceOn) return;

        const advance = () => goTo(resolveStep(advanceOn.goTo));
        const options = advanceOn.closeOnTimeout ? { onTimeout: () => setIsOpen(false) } : undefined;

        const listener = (event: MouseEvent) => {
            if (!(event.target as Element | null)?.closest(advanceOn.click)) return;
            if ('waitFor' in advanceOn) waitForStableRect(advanceOn.waitFor, advance, options);
            else waitForRemoval(advanceOn.waitForRemoval, advance, options);
        };

        document.addEventListener('click', listener, true);
        return () => document.removeEventListener('click', listener, true);
    }, [advanceOn, goTo, setIsOpen]);
}

/** Adds a class to <html> while the step is showing, for the `tutorial-raise-*` styles. */
export function useHtmlClass(className: string | undefined) {
    useEffect(() => {
        if (!className) return;
        document.documentElement.classList.add(className);
        return () => document.documentElement.classList.remove(className);
    }, [className]);
}
