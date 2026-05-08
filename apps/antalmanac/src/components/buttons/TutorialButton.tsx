import { removeSampleClasses } from '$lib/tourExampleGeneration';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useCallback, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface TutorialButtonProps {
    onMenuClose?: () => void;
}

export const TutorialButton = ({ onMenuClose }: TutorialButtonProps) => {
    const { setCurrentStep, setIsOpen, isOpen } = useTour();
    const [displaySearch, disableManualSearch] = useCoursePaneStore(
        useShallow((state) => [state.displaySearch, state.disableManualSearch])
    );

    const startTutorial = useCallback(() => {
        displaySearch();
        disableManualSearch();
        setCurrentStep(0);
        setIsOpen(true);
    }, [displaySearch, disableManualSearch, setCurrentStep, setIsOpen]);

    useEffect(() => {
        return () => {
            removeSampleClasses();
        };
    }, [isOpen]);

    const handleClick = useCallback(() => {
        onMenuClose?.();
        startTutorial();
    }, [startTutorial, onMenuClose]);

    return (
        <Button onClick={handleClick} color="inherit" startIcon={<PlayLesson />} size="large" variant="text">
            Tutorial
        </Button>
    );
};
