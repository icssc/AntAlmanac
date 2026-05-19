import { useCoursePaneUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { removeSampleClasses } from '$lib/tourExampleGeneration';
import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useCallback, useEffect } from 'react';

interface TutorialButtonProps {
    onMenuClose?: () => void;
}

export const TutorialButton = ({ onMenuClose }: TutorialButtonProps) => {
    const { setCurrentStep, setIsOpen, isOpen } = useTour();
    const { displaySearch, setManualSearchEnabled } = useCoursePaneUrlState();

    const startTutorial = useCallback(() => {
        void displaySearch();
        void setManualSearchEnabled(false);
        setCurrentStep(0);
        setIsOpen(true);
    }, [displaySearch, setCurrentStep, setIsOpen, setManualSearchEnabled]);

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
