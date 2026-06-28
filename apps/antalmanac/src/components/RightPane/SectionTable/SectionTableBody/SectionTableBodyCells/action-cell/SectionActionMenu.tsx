import { addCourse } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { MoreHoriz } from '@mui/icons-material';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { AASection } from '@packages/antalmanac-types';
import { memo, useCallback, useState } from 'react';

interface SectionActionMenuProps {
    section: AASection;
    course: AACourseWithTerm;
    scheduleNames: string[];
}

export const SectionActionMenu = memo(function SectionActionMenu({
    section,
    course,
    scheduleNames,
}: SectionActionMenuProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

    const handleOpen = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleAddToSchedule = useCallback(
        (scheduleIndex: number) => {
            addCourse(section, course, scheduleIndex);
            handleClose();
        },
        [section, course, handleClose]
    );

    const handleAddToAll = useCallback(() => {
        addCourse(section, course, AppStore.schedule.getNumberOfSchedules());
        handleClose();
    }, [section, course, handleClose]);

    const handleCopyLink = useCallback(() => {
        const url = new URL(window.location.href);
        const params = new URLSearchParams();
        params.set('sectionCode', section.sectionCode);
        url.search = params.toString();

        navigator.clipboard.writeText(url.toString()).then(
            () => openSnackbar('success', 'Course link copied!'),
            () => openSnackbar('error', 'Failed to copy link')
        );
        handleClose();
    }, [section.sectionCode, handleClose]);

    return (
        <>
            <IconButton onClick={handleOpen} size="small" sx={{ p: 0.5 }}>
                <MoreHoriz fontSize="small" />
            </IconButton>

            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
            >
                {scheduleNames.map((name, index) => (
                    <MenuItem key={index} onClick={() => handleAddToSchedule(index)}>
                        Add to {name}
                    </MenuItem>
                ))}
                <MenuItem onClick={handleAddToAll}>Add to All Schedules</MenuItem>
                <MenuItem onClick={handleCopyLink}>Copy Course Link</MenuItem>
            </Menu>
        </>
    );
});
