'use client';

import CloseIcon from '@mui/icons-material/Close';
import { Button, IconButton } from '@mui/material';
import { useTour } from '@reactour/tour';
import Image, { type StaticImageData } from 'next/image';
import type { CSSProperties, PropsWithChildren } from 'react';

export type TutorialVariant = 'welcome' | 'step';

interface TutorialStepProps extends PropsWithChildren {
    variant?: TutorialVariant;
    padding: CSSProperties['padding'];
}

/** A step's popover content. Compose it from the parts below. */
export function TutorialStep({ variant = 'step', padding, children }: TutorialStepProps) {
    return (
        <div className={`tutorial-step tutorial-step--${variant}`} style={{ padding }}>
            {children}
        </div>
    );
}

interface TutorialMascotProps {
    src: StaticImageData;
    /** Size and placement, relative to the popover's inner edge. */
    style?: CSSProperties;
}

export function TutorialMascot({ src, style }: TutorialMascotProps) {
    return <Image src={src} alt="" className="tutorial-mascot" style={style} />;
}

export function TutorialCloseButton() {
    const { setIsOpen } = useTour();

    return (
        <IconButton
            aria-label="Close tutorial"
            size="small"
            sx={{ position: 'absolute', top: 3, right: 3, zIndex: 2 }}
            onClick={() => setIsOpen(false)}
        >
            <CloseIcon fontSize="small" />
        </IconButton>
    );
}

export function TutorialTitle({ children }: PropsWithChildren) {
    return <h2 className="tutorial-title">{children}</h2>;
}

export function TutorialDescription({ children }: PropsWithChildren) {
    return <p className="tutorial-description">{children}</p>;
}

interface TutorialButtonsProps extends PropsWithChildren {
    /** Space between buttons, in px. Defaults to the stylesheet's. */
    gap?: number;
}

export function TutorialButtons({ gap, children }: TutorialButtonsProps) {
    return (
        <div className="tutorial-buttons" style={{ gap }}>
            {children}
        </div>
    );
}

interface TutorialButtonProps extends PropsWithChildren {
    onClick: () => void;
}

export function TutorialButton({ onClick, children }: TutorialButtonProps) {
    return (
        <Button variant="contained" size="large" onClick={onClick}>
            {children}
        </Button>
    );
}

interface TutorialProgressProps {
    /** Fraction from 0 to 1. */
    value: number;
}

export function TutorialProgress({ value }: TutorialProgressProps) {
    return (
        <div className="tutorial-progress">
            <div className="tutorial-progress-fill" style={{ width: `${value * 100}%` }} />
        </div>
    );
}
