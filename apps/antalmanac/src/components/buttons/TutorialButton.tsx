import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    useCourseSearchForm,
    useCourseSearchMode,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { useGoToTab } from '$lib/tabs/hooks';
import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useCallback } from 'react';

interface TutorialButtonProps {
    onMenuClose?: () => void;
}

export const TutorialButton = ({ onMenuClose }: TutorialButtonProps) => {
    const goToTab = useGoToTab();
    const { setCurrentStep, setIsOpen } = useTour();
    const { setSearchMode } = useCourseSearchMode();
    const { resetForm } = useCourseSearchForm();
    const { clearView } = useCourseSearchView();

    const startTutorial = useCallback(() => {
        goToTab('search');
        setSearchMode(COURSE_SEARCH_MODE.QUICK);
        resetForm();
        clearView();
        setCurrentStep(0);
        setIsOpen(true);
    }, [clearView, goToTab, resetForm, setCurrentStep, setIsOpen, setSearchMode]);

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
