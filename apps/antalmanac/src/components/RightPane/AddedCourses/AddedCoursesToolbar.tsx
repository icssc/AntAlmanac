import { clearSchedules } from '$actions/AppStoreActions';
import { ClearScheduleButton } from '$components/buttons/Clear';
import { CopyScheduleButton } from '$components/buttons/Copy';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { SelectSchedulePopover } from '$components/Calendar/Toolbar/ScheduleSelect/ScheduleSelect';
import CopyScheduleDialog from '$components/dialogs/CopySchedule';
import { NotificationsDialog } from '$components/RightPane/AddedCourses/Notifications/NotificationsDialog';
import { ColumnToggleDropdown } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import {
    ToolbarFrame,
    ToolbarRedoButton,
    ToolbarResponsiveCluster,
    ToolbarSpacer,
    ToolbarUndoButton,
    ToolbarUnitsBadge,
} from '$components/ScheduleToolbar';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { ContentCopy, DeleteOutline } from '@mui/icons-material';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback, useState } from 'react';

interface AddedCoursesToolbarProps {
    scheduleNames: string[];
    scheduleIndex: number;
    scheduleUnits: number;
}

export const AddedCoursesToolbar = memo(function AddedCoursesToolbar({
    scheduleNames,
    scheduleIndex,
    scheduleUnits,
}: AddedCoursesToolbarProps) {
    const postHog = usePostHog();
    const [copyDialogOpen, setCopyDialogOpen] = useState(false);

    const handleCopySchedule = useCallback(() => {
        setCopyDialogOpen(true);
    }, []);

    const handleCopyDialogClose = useCallback(() => {
        setCopyDialogOpen(false);
    }, []);

    const handleClearSchedule = useCallback(() => {
        if (!window.confirm('Are you sure you want to clear this schedule?')) return;
        logAnalytics(postHog, {
            category: analyticsEnum.addedClasses,
            action: analyticsEnum.addedClasses.actions.CLEAR_SCHEDULE,
        });
        clearSchedules();
    }, [postHog]);

    return (
        <>
            <ToolbarFrame>
                <SelectSchedulePopover />
                <ToolbarUnitsBadge units={scheduleUnits} />
                <ToolbarSpacer />
                <ToolbarUndoButton />
                <ToolbarRedoButton />
                <ToolbarResponsiveCluster
                    always={
                        <>
                            <CustomEventDialog scheduleNames={scheduleNames} />
                            <NotificationsDialog />
                        </>
                    }
                    wide={
                        <>
                            <CopyScheduleButton index={scheduleIndex} />
                            <ClearScheduleButton
                                size="medium"
                                fontSize="small"
                                analyticsCategory={analyticsEnum.addedClasses}
                            />
                            <ColumnToggleDropdown />
                        </>
                    }
                    narrowMenu={
                        <>
                            <MenuItem onClick={handleCopySchedule}>
                                <ListItemIcon>
                                    <ContentCopy fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Copy Schedule</ListItemText>
                            </MenuItem>
                            <MenuItem onClick={handleClearSchedule}>
                                <ListItemIcon>
                                    <DeleteOutline fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>Clear Schedule</ListItemText>
                            </MenuItem>
                        </>
                    }
                />
            </ToolbarFrame>
            <CopyScheduleDialog fullWidth open={copyDialogOpen} index={scheduleIndex} onClose={handleCopyDialogClose} />
        </>
    );
});
