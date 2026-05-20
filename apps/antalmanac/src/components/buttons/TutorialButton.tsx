import { useCourseSearchUrlState } from '$components/RightPane/CoursePane/SearchForm/searchParams';
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
    const { setSearchMode, resetAll } = useCourseSearchUrlState();
    const { setSearchFormIsDisplayed, setAdvancedSearchEnabled } = useCoursePaneStore(
        useShallow((store) => ({
            setSearchFormIsDisplayed: store.setSearchFormIsDisplayed,
            setAdvancedSearchEnabled: store.setAdvancedSearchEnabled,
        }))
    );

    const startTutorial = useCallback(() => {
        setSearchFormIsDisplayed(true);
        setAdvancedSearchEnabled(false);
        void setSearchMode('quick');
        void resetAll();
        setCurrentStep(0);
        setIsOpen(true);
    }, [resetAll, setAdvancedSearchEnabled, setCurrentStep, setIsOpen, setSearchFormIsDisplayed, setSearchMode]);

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
