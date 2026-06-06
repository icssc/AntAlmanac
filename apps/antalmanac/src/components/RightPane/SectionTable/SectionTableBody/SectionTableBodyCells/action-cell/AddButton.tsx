import { addCourse } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Add } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { AASection, AACourseWithTerm } from '@packages/antalmanac-types';
import { useCallback } from 'react';

interface AddButtonProps {
    section: AASection;
    course: AACourseWithTerm;
    scheduleConflict: boolean;
}

export function AddButton({ section, course, scheduleConflict }: AddButtonProps) {
    const handleClick = useCallback(() => {
        for (const meeting of section.meetings) {
            if (meeting.timeIsTBA) {
                openSnackbar('success', 'Online/TBA class added');
                break;
            }
        }
        addCourse(section, course, AppStore.getCurrentScheduleIndex());
    }, [section, course]);

    const button = (
        <IconButton onClick={handleClick} size="small" sx={{ p: 0.5 }}>
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
