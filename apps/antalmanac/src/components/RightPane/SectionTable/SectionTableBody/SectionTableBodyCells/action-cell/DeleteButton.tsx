import { deleteCourse } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';
import { Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { AACourseWithTerm, AASection } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback } from 'react';

interface DeleteButtonProps {
    section: AASection;
    course: AACourseWithTerm;
}

export const DeleteButton = memo(function DeleteButton({ section, course }: DeleteButtonProps) {
    const postHog = usePostHog();

    const handleClick = useCallback(() => {
        deleteCourse(section.sectionCode, course.term, AppStore.getCurrentScheduleIndex());

        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
        });
    }, [postHog, course.term, section.sectionCode]);

    return (
        <IconButton onClick={handleClick} size="small" sx={{ p: 0.5 }}>
            <Delete fontSize="small" />
        </IconButton>
    );
});
