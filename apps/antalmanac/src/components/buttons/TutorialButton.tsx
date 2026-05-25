import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useCallback } from 'react';

interface TutorialButtonProps {
    onMenuClose?: () => void;
}

export const TutorialButton = ({ onMenuClose }: TutorialButtonProps) => {
    const { setCurrentStep, setIsOpen } = useTour();
    const { setSearchMode, resetAll, clearView } = useCourseSearchUrlState();

    const startTutorial = useCallback(() => {
        void setSearchMode('quick');
        void resetAll();
        void clearView();
        setCurrentStep(0);
        setIsOpen(true);
    }, [clearView, resetAll, setCurrentStep, setIsOpen, setSearchMode]);

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
