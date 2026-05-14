import { clearSchedules } from '$actions/AppStoreActions';
import { ClearScheduleButton } from '$components/buttons/Clear';
import DownloadButton from '$components/buttons/Download';
import ScreenshotButton from '$components/buttons/Screenshot';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { SelectSchedulePopover } from '$components/Calendar/Toolbar/ScheduleSelect/ScheduleSelect';
import {
    ToolbarFinalsToggle,
    ToolbarFrame,
    ToolbarRedoButton,
    ToolbarResponsiveCluster,
    ToolbarSpacer,
    ToolbarUndoButton,
} from '$components/ScheduleToolbar';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { exportCalendar } from '$lib/download';
import { useThemeStore } from '$stores/SettingsStore';
import { Panorama, Download, DeleteOutline } from '@mui/icons-material';
import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { saveAs } from 'file-saver';
import html2canvas from 'html2canvas';
import { usePostHog } from 'posthog-js/react';
import { memo, useCallback } from 'react';

interface ScheduleCalendarToolbarProps {
    scheduleNames: string[];
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;
    onScreenshot?: () => void;
}

export const ScheduleCalendarToolbar = memo(function ScheduleCalendarToolbar({
    scheduleNames,
    showFinalsSchedule,
    toggleDisplayFinalsSchedule,
    onScreenshot,
}: ScheduleCalendarToolbarProps) {
    const { isDark } = useThemeStore();
    const postHog = usePostHog();

    const handleScreenshot = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.SCREENSHOT,
        });
        onScreenshot?.();
        setTimeout(() => {
            void html2canvas(document.getElementById('screenshot') as HTMLElement, {
                scale: 2.5,
                backgroundColor: isDark ? '#303030' : '#fafafa',
            }).then((canvas) => {
                const imgRaw = canvas.toDataURL('image/png');
                saveAs(imgRaw, 'Schedule.png');
            });
        }, 1);
    }, [postHog, isDark, onScreenshot]);

    const handleDownload = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.DOWNLOAD,
        });
        exportCalendar();
    }, [postHog]);

    const handleClearSchedule = useCallback(() => {
        if (!window.confirm('Are you sure you want to clear this schedule?')) return;
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.CLEAR_SCHEDULE,
        });
        clearSchedules();
    }, [postHog]);

    return (
        <ToolbarFrame>
            <SelectSchedulePopover />
            <ToolbarFinalsToggle
                showFinalsSchedule={showFinalsSchedule}
                toggleDisplayFinalsSchedule={toggleDisplayFinalsSchedule}
            />
            <ToolbarSpacer />
            <ToolbarUndoButton />
            <ToolbarRedoButton />
            <ToolbarResponsiveCluster
                always={<CustomEventDialog scheduleNames={scheduleNames} />}
                wide={
                    <>
                        <ScreenshotButton onScreenshot={onScreenshot} />
                        <DownloadButton />
                        <ClearScheduleButton
                            size="medium"
                            fontSize="small"
                            analyticsCategory={analyticsEnum.calendar}
                        />
                    </>
                }
                narrowMenu={
                    <>
                        <MenuItem onClick={handleScreenshot}>
                            <ListItemIcon>
                                <Panorama fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Get Screenshot</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleDownload}>
                            <ListItemIcon>
                                <Download fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Download Calendar</ListItemText>
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
    );
});
