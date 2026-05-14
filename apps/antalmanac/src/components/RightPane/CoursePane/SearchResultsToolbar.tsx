import { SelectSchedulePopover } from '$components/Calendar/Toolbar/ScheduleSelect/ScheduleSelect';
import { NotificationsDialog } from '$components/RightPane/AddedCourses/Notifications/NotificationsDialog';
import { ColumnToggleDropdown } from '$components/RightPane/CoursePane/CoursePaneButtonRow';
import {
    ToolbarFrame,
    ToolbarRedoButton,
    ToolbarResponsiveCluster,
    ToolbarSpacer,
    ToolbarUndoButton,
} from '$components/ScheduleToolbar';
import { ArrowBack, Refresh } from '@mui/icons-material';
import { IconButton, Tooltip } from '@mui/material';
import { memo } from 'react';

interface SearchResultsToolbarProps {
    onDismissSearchResults: () => void;
    onRefreshSearch: () => void;
}

export const SearchResultsToolbar = memo(function SearchResultsToolbar({
    onDismissSearchResults,
    onRefreshSearch,
}: SearchResultsToolbarProps) {
    return (
        <ToolbarFrame>
            <Tooltip title="Back">
                <IconButton onClick={onDismissSearchResults} size="medium">
                    <ArrowBack fontSize="small" />
                </IconButton>
            </Tooltip>
            <Tooltip title="Refresh Search Results">
                <IconButton onClick={onRefreshSearch} size="medium">
                    <Refresh fontSize="small" />
                </IconButton>
            </Tooltip>
            <SelectSchedulePopover />
            <ToolbarSpacer />
            <ToolbarUndoButton />
            <ToolbarRedoButton />
            <ToolbarResponsiveCluster
                always={<NotificationsDialog />}
                wide={<ColumnToggleDropdown />}
                narrowMenu={null}
            />
        </ToolbarFrame>
    );
});
