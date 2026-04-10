import { Add } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { AASection, CourseDetails } from '@packages/antalmanac-types';
import { useCallback } from 'react';

import { addCourse } from '$actions/AppStoreActions';
import { useIsMobile } from '$hooks/useIsMobile';
import { Term } from '$lib/termData';
import AppStore from '$stores/AppStore';
import { openSnackbar } from '$stores/SnackbarStore';

interface AddButtonProps {
    section: AASection;
    courseDetails: CourseDetails;
    term: Term['shortName'];
    scheduleConflict: boolean;
}

export function AddButton({ section, courseDetails, term, scheduleConflict }: AddButtonProps) {
    const isMobile = useIsMobile();

    const handleClick = useCallback(() => {
        for (const meeting of section.meetings) {
            if (meeting.timeIsTBA) {
                openSnackbar('success', 'Online/TBA class added');
                break;
            }
        }
        addCourse(section, courseDetails, term, AppStore.getCurrentScheduleIndex());
    }, [section, courseDetails, term]);

    const button = (
        <IconButton onClick={handleClick} size="small" sx={{ p: isMobile ? 1 : 0.5 }}>
            <Add fontSize="small" />
        </IconButton>
    );

    if (scheduleConflict) {
        return (
            <Tooltip title="This course overlaps with another event in your calendar!" arrow disableInteractive>
                {button}
            </Tooltip>
        );
    }

    return button;
}
