import { Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { AASection } from '@packages/antalmanac-types';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback } from 'react';

import { deleteCourse } from '$actions/AppStoreActions';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { Term } from '$lib/termData';
import AppStore from '$stores/AppStore';

interface DeleteButtonProps {
    sectionCode: AASection['sectionCode'];
    term: Term['shortName'];
}

export const DeleteButton = memo(function DeleteButton({ sectionCode, term }: DeleteButtonProps) {
    const postHog = usePostHog();

    const handleClick = useCallback(() => {
        deleteCourse(sectionCode, term, AppStore.getCurrentScheduleIndex());

        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.DELETE_COURSE,
        });
    }, [postHog, term, sectionCode]);

    return (
        <IconButton onClick={handleClick} size="small" sx={{ p: 1 }}>
            <Delete fontSize="small" />
        </IconButton>
    );
});
