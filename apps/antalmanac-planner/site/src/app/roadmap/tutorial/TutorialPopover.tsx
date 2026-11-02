'use client';

import { type Position, useTour } from '@reactour/tour';
import type { StaticImageData } from 'next/image';
import type { CSSProperties, ReactNode } from 'react';

import { useAdvanceOn, useGoToStep, useHtmlClass } from './hooks';
import type { TourStepName } from './tutorialConfig';
import {
    TutorialButton,
    TutorialButtons,
    TutorialCloseButton,
    TutorialDescription,
    TutorialMascot,
    TutorialProgress,
    TutorialStep,
    TutorialTitle,
    type TutorialVariant,
} from './TutorialStep';

/** A step, or a function that picks one when it's needed, e.g. depending on what's on the page. */
export type StepChoice = TourStepName | (() => TourStepName);

export function resolveStep(choice: StepChoice): TourStepName {
    return typeof choice === 'function' ? choice() : choice;
}

export interface TourButton {
    label: string;
    /** Step to go to. Omit to close the tour. */
    goTo?: StepChoice;
    /** Runs before moving on, e.g. to close a menu the step had the user open. */
    before?: () => void;
}

/** Advance when the user clicks `click`, once `waitFor` has settled into place or `waitForRemoval` is gone. */
export type AdvanceOn = {
    click: string;
    goTo: StepChoice;
    /** Close the tour if the wait times out. */
    closeOnTimeout?: boolean;
} & ({ waitFor: string } | { waitForRemoval: string });

/** Everything about one step. Sizes and offsets come from the step's Figma frame. */
export interface TourStepConfig {
    // Popover box
    width: number;
    minHeight: number;
    padding: CSSProperties['padding'];
    borderRadius?: number;
    borderWidth?: number;

    // Placement
    /** Element to highlight. Without one, the whole page is dimmed and the popover is centered. */
    target?: string;
    /** Where the popover's top-left corner goes, relative to the highlighted element. */
    position?: Position;
    /** Draw a border around the highlighted element. */
    outline?: boolean;
    /** Grow (or, negative, shrink) the highlight around the element: [top, right, bottom, left]. Defaults to hugging it. */
    highlightPadding?: [number, number, number, number];
    /** Dim the page. Steps where the user works freely across the page turn this off. */
    mask?: boolean;
    /** Elements whose size changes should re-measure the highlight. */
    observe?: string[];

    // Content
    variant?: TutorialVariant;
    title?: ReactNode;
    text: ReactNode;
    /** `style` places the mascot relative to the popover's inner edge. */
    mascot: { src: StaticImageData; style: CSSProperties };
    buttons?: TourButton[];
    /** Space between buttons, in px. Defaults to the stylesheet's. */
    buttonGap?: number;
    /** Fraction from 0 to 1. Omit to hide the progress bar. */
    progress?: number;

    // Behavior
    advanceOn?: AdvanceOn;
    /** Class added to <html> while the step is showing, for the `tutorial-raise-*` styles. */
    htmlClass?: string;
}

/** Renders any step's popover content from its config. */
export function TutorialPopover({ config }: { config: TourStepConfig }) {
    const { variant = 'step', title, text, mascot, buttons, buttonGap, progress, padding } = config;
    const goTo = useGoToStep();
    const { setIsOpen } = useTour();
    useAdvanceOn(config.advanceOn);
    useHtmlClass(config.htmlClass);

    const press = ({ goTo: next, before }: TourButton) => {
        before?.();
        if (next) goTo(resolveStep(next));
        else setIsOpen(false);
    };

    return (
        <TutorialStep variant={variant} padding={padding}>
            <TutorialMascot src={mascot.src} style={mascot.style} />
            {variant === 'step' && <TutorialCloseButton />}
            {title && <TutorialTitle>{title}</TutorialTitle>}
            <TutorialDescription>{text}</TutorialDescription>
            {buttons && (
                <TutorialButtons gap={buttonGap}>
                    {buttons.map((button) => (
                        <TutorialButton key={button.label} onClick={() => press(button)}>
                            {button.label}
                        </TutorialButton>
                    ))}
                </TutorialButtons>
            )}
            {progress !== undefined && <TutorialProgress value={progress} />}
        </TutorialStep>
    );
}
