'use client';

import { TourProvider, useTour } from '@reactour/tour';
import { type PropsWithChildren, useEffect } from 'react';

import './tutorial.scss';
import { basePopoverStyle, createTourSteps } from './tourSteps';
import { initialTourStep, markTourHasRun, tourShouldRun, waitForRemoval } from './tutorialConfig';

const CHANGELOG_DIALOG = '.changelog-modal';

function TourInitializer() {
    const { setSteps, setCurrentStep, setIsOpen } = useTour();

    useEffect(() => {
        setSteps?.(createTourSteps());
        if (!tourShouldRun()) return;

        // Marked on open rather than via `beforeClose`: reactour runs that in an effect
        // cleanup, which Strict Mode and Fast Refresh trigger without the tour closing.
        markTourHasRun();
        // New visitors first get the changelog dialog, which traps keyboard focus (so the major
        // step couldn't be typed into). Give it a frame to open, then wait until it's dismissed.
        requestAnimationFrame(() =>
            waitForRemoval(
                CHANGELOG_DIALOG,
                () => {
                    setCurrentStep(initialTourStep());
                    setIsOpen(true);
                },
                { timeoutMs: Infinity }
            )
        );
    }, [setSteps, setCurrentStep, setIsOpen]);

    return null;
}

export function RoadmapTourProvider({ children }: PropsWithChildren) {
    return (
        <TourProvider
            steps={[]}
            padding={5}
            showBadge={false}
            showNavigation={false}
            showCloseButton={false}
            // Arrow keys would skip past branch questions; Esc still closes.
            disableKeyboardNavigation={['left', 'right']}
            // A stray click outside shouldn't end the tour for good.
            onClickMask={() => {}}
            styles={{
                maskArea: (base) => ({ ...base, rx: 5 }),
                maskWrapper: (base) => ({ ...base, color: 'rgba(0, 0, 0, 0.3)' }),
                popover: (base) => ({ ...base, ...basePopoverStyle }),
            }}
        >
            <TourInitializer />
            {children}
        </TourProvider>
    );
}
