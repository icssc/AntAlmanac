import { COURSE_SEARCH_MODE } from '$components/RightPane/CoursePane/SearchParams/constants';
import {
    useCourseSearchForm,
    useCourseSearchMode,
    useCourseSearchView,
} from '$components/RightPane/CoursePane/SearchParams/hooks';
import { TAB_HREF } from '$lib/tabs/tabs';
import { PlayLesson } from '@mui/icons-material';
import { Button } from '@mui/material';
import { useTour } from '@reactour/tour';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

interface TutorialButtonProps {
    onMenuClose?: () => void;
}

export const TutorialButton = ({ onMenuClose }: TutorialButtonProps) => {
    const router = useRouter();
    const { setCurrentStep, setIsOpen } = useTour();
    const { setSearchMode } = useCourseSearchMode();
    const { resetForm } = useCourseSearchForm();
    const { clearView } = useCourseSearchView();

    const startTutorial = useCallback(() => {
        router.push(TAB_HREF.search);
        setSearchMode(COURSE_SEARCH_MODE.QUICK);
        resetForm();
        clearView();
        setCurrentStep(0);
        setIsOpen(true);
    }, [clearView, router, resetForm, setCurrentStep, setIsOpen, setSearchMode]);

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
