import { useCourseSearchActions } from '$components/RightPane/CoursePane/SearchForm/SearchParams';
import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useCallback } from 'react';

interface TutorialButtonProps {
    onMenuClose?: () => void;
}

export const TutorialButton = ({ onMenuClose }: TutorialButtonProps) => {
    const { setCurrentStep, setIsOpen } = useTour();
    const { setSearchMode, resetForm, clearView } = useCourseSearchActions();

    const startTutorial = useCallback(() => {
        void setSearchMode('quick');
        void resetForm();
        void clearView();
        setCurrentStep(0);
        setIsOpen(true);
    }, [clearView, resetForm, setCurrentStep, setIsOpen, setSearchMode]);

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
