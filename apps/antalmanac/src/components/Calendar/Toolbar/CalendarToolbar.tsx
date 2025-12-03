import {
    Undo as UndoIcon,
    Redo as RedoIcon,
    Description as DescriptionIcon,
    DescriptionOutlined as DescriptionOutlinedIcon,
    MoreVert as MoreVertIcon,
    Panorama,
    Download,
    DeleteOutline,
    Add,
} from '@mui/icons-material';
import {
    useTheme,
    useMediaQuery,
    Box,
    Button,
    IconButton,
    Paper,
    Tooltip,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
} from '@mui/material';
import { PostHog, usePostHog } from 'posthog-js/react';
import { useState, useCallback, useEffect, memo, useRef } from 'react';

import { redoAction, undoDelete } from '$actions/AppStoreActions';
import { CustomEventDialog } from '$components/Calendar/Toolbar/CustomEventDialog/CustomEventDialog';
import { SelectSchedulePopover } from '$components/Calendar/Toolbar/ScheduleSelect/ScheduleSelect';
import { ClearScheduleButton } from '$components/buttons/Clear';
import DownloadButton from '$components/buttons/Download';
import ScreenshotButton from '$components/buttons/Screenshot';
import { useIsMobile } from '$hooks/useIsMobile';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import AppStore from '$stores/AppStore';

function handleUndo(postHog?: PostHog) {
    return () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.UNDO,
        });
        undoDelete(null);
    };
}

function handleRedo(postHog?: PostHog) {
    return () => {
        logAnalytics(postHog, {
            category: analyticsEnum.calendar,
            action: analyticsEnum.calendar.actions.REDO,
        });
        redoAction();
    };
}

export interface CalendarPaneToolbarProps {
    scheduleNames: string[];
    currentScheduleIndex: number;
    showFinalsSchedule: boolean;
    toggleDisplayFinalsSchedule: () => void;
}

/**
 * The root toolbar will pass down the schedule names to its children.
 */
export const CalendarToolbar = memo((props: CalendarPaneToolbarProps) => {
    const theme = useTheme();
    const { showFinalsSchedule, toggleDisplayFinalsSchedule } = props;
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const isSmallScreen = useMediaQuery(theme.breakpoints.down('xxs'));
    const isMobile = useIsMobile();
    const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(menuAnchorEl);

    const postHog = usePostHog();

    // Refs to trigger existing button components
    const screenshotButtonRef = useRef<HTMLDivElement>(null);
    const downloadButtonRef = useRef<HTMLDivElement>(null);
    const clearButtonRef = useRef<HTMLDivElement>(null);

    const handleToggleFinals = useCallback(() => {
        if (!showFinalsSchedule) {
            logAnalytics(postHog, {
                category: analyticsEnum.calendar,
                action: analyticsEnum.calendar.actions.DISPLAY_FINALS,
            });
        }
        toggleDisplayFinalsSchedule();
    }, [toggleDisplayFinalsSchedule]);

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setMenuAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setMenuAnchorEl(null);
    };

    const handleScreenshot = () => {
        handleMenuClose();
        const button = screenshotButtonRef.current?.querySelector('button');
        if (button) {
            button.click();
        }
    };

    const handleDownload = () => {
        handleMenuClose();
        const button = downloadButtonRef.current?.querySelector('button');
        if (button) {
            button.click();
        }
    };

    const handleClearSchedule = () => {
        handleMenuClose();
        const button = clearButtonRef.current?.querySelector('button');
        if (button) {
            button.click();
        }
    };

    const customEventButtonRef = useRef<HTMLDivElement>(null);

    const handleCustomEventOpen = () => {
        handleMenuClose();
        // Trigger the hidden CustomEventDialog button
        setTimeout(() => {
            const button = customEventButtonRef.current?.querySelector('button');
            if (button) {
                button.click();
            }
        }, 0);
    };

    return (
        <Paper
            elevation={0}
            variant="outlined"
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 1,
                alignItems: 'center',
                padding: 1,
                borderRadius: '4px 4px 0 0',
            }}
        >
            <Box gap={1} display="flex" alignItems="center">
                <SelectSchedulePopover />
                <Tooltip title="Toggle showing finals schedule">
                    {isSmallScreen ? (
                        <IconButton
                            color={showFinalsSchedule ? 'primary' : 'inherit'}
                            onClick={handleToggleFinals}
                            id={showFinalsSchedule ? 'finals-button-pressed' : 'finals-button'}
                            disabled={skeletonMode}
                            size="small"
                            sx={{
                                border: '1px solid',
                                borderColor: showFinalsSchedule ? 'primary' : 'inherit',
                                borderRadius: '4px',
                                padding: '3px',
                            }}
                        >
                            {showFinalsSchedule ? <DescriptionIcon /> : <DescriptionOutlinedIcon />}
                        </IconButton>
                    ) : (
                        <Button
                            color={showFinalsSchedule ? 'primary' : 'inherit'}
                            variant={showFinalsSchedule ? 'contained' : 'outlined'}
                            onClick={handleToggleFinals}
                            size="small"
                            id={showFinalsSchedule ? 'finals-button-pressed' : 'finals-button'}
                            disabled={skeletonMode}
                        >
                            Finals
                        </Button>
                    )}
                </Tooltip>
            </Box>
            <Box flexGrow={1} />

            {isMobile ? (
                <>
                    <Tooltip title="More options">
                        <IconButton onClick={handleMenuOpen} size="medium" disabled={skeletonMode}>
                            <MoreVertIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Menu
                        anchorEl={menuAnchorEl}
                        open={menuOpen}
                        onClose={handleMenuClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'right',
                        }}
                        transformOrigin={{
                            vertical: 'top',
                            horizontal: 'right',
                        }}
                    >
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
                        <MenuItem onClick={handleUndo(postHog)} disabled={skeletonMode}>
                            <ListItemIcon>
                                <UndoIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Undo</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleRedo(postHog)} disabled={skeletonMode}>
                            <ListItemIcon>
                                <RedoIcon fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Redo</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleClearSchedule}>
                            <ListItemIcon>
                                <DeleteOutline fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Clear Schedule</ListItemText>
                        </MenuItem>
                        <MenuItem onClick={handleCustomEventOpen}>
                            <ListItemIcon>
                                <Add fontSize="small" />
                            </ListItemIcon>
                            <ListItemText>Add Custom Event</ListItemText>
                        </MenuItem>
                    </Menu>
                    {/* Hidden button components for mobile menu to trigger */}
                    <Box sx={{ display: 'none' }}>
                        <Box ref={screenshotButtonRef}>
                            <ScreenshotButton />
                        </Box>
                        <Box ref={downloadButtonRef}>
                            <DownloadButton />
                        </Box>
                        <Box ref={clearButtonRef}>
                            <ClearScheduleButton
                                size="medium"
                                fontSize="small"
                                skeletonMode={skeletonMode}
                                analyticsCategory={analyticsEnum.calendar}
                            />
                        </Box>
                        <Box ref={customEventButtonRef}>
                            <CustomEventDialog key="custom-mobile" scheduleNames={AppStore.getScheduleNames()} />
                        </Box>
                    </Box>
                </>
            ) : (
                <Box display="flex" flexWrap="wrap" alignItems="center" gap={0.5}>
                    <ScreenshotButton />

                    <DownloadButton />

                    <Tooltip title="Undo last action">
                        <IconButton onClick={handleUndo(postHog)} size="medium" disabled={skeletonMode}>
                            <UndoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Redo last action">
                        <IconButton onClick={handleRedo(postHog)} size="medium" disabled={skeletonMode}>
                            <RedoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>

                    <ClearScheduleButton
                        size="medium"
                        fontSize="small"
                        skeletonMode={skeletonMode}
                        analyticsCategory={analyticsEnum.calendar}
                    />

                    <CustomEventDialog key="custom" scheduleNames={AppStore.getScheduleNames()} />
                </Box>
            )}
        </Paper>
    );
});

CalendarToolbar.displayName = 'CalendarToolbar';
