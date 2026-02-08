import { ContentPaste } from '@mui/icons-material';
import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    FormControlLabel,
    Paper,
    Stack,
    Tooltip,
    Typography,
} from '@mui/material';
import { ShortCourseSchedule } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import { DODGER_BLUE } from '$src/globals';
import AppStore from '$stores/AppStore';

export function Export() {
    const [skeletonMode, _setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedScheduleIndices, setSelectedScheduleIndices] = useState<Set<number>>(new Set());
    const [schedules, setSchedules] = useState<ShortCourseSchedule[]>([]);

    const handleOpen = useCallback(() => {
        setOpenDialog(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpenDialog(false);
        setSelectedScheduleIndices(new Set());
    }, []);

    const handleToggleSchedule = useCallback((index: number) => {
        setSelectedScheduleIndices((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    }, []);

    const handleExport = useCallback(() => {
        if (selectedScheduleIndices.size === 0) {
            openSnackbar('error', 'Please select at least one schedule to export.');
            return;
        }

        try {
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
            const schedulesToExport: ShortCourseSchedule[] = scheduleSaveState.schedules.filter((_, index) =>
                selectedScheduleIndices.has(index)
            );

            const exportData = {
                schedules: schedulesToExport,
            };

            const jsonString = JSON.stringify(exportData, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `antalmanac-schedules-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            openSnackbar('success', `Successfully exported ${schedulesToExport.length} schedule(s)!`);
            handleClose();
        } catch (error) {
            console.error('Export error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to export schedules.';
            openSnackbar('error', errorMessage);
        }
    }, [selectedScheduleIndices, handleClose]);

    useEffect(() => {
        if (openDialog) {
            const scheduleSaveState = AppStore.schedule.getScheduleAsSaveState();
            setSchedules(scheduleSaveState.schedules);
            setSelectedScheduleIndices(new Set(scheduleSaveState.schedules.map((_, index) => index)));
        }
    }, [openDialog]);

    return (
        <>
            <Tooltip title="Export your schedule data to a JSON file">
                <Button
                    onClick={handleOpen}
                    color="inherit"
                    startIcon={<ContentPaste />}
                    disabled={skeletonMode}
                    id="export-button"
                >
                    Export
                </Button>
            </Tooltip>

            <Dialog open={openDialog} onClose={handleClose} maxWidth="xs" fullWidth>
                <DialogTitle>Export Schedules</DialogTitle>
                <DialogContent>
                    <DialogContentText sx={{ mb: 2 }}>
                        Select which schedules you want to export as a JSON file.
                    </DialogContentText>

                    {schedules.length > 0 && (
                        <>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={
                                            selectedScheduleIndices.size === schedules.length && schedules.length > 0
                                        }
                                        indeterminate={
                                            selectedScheduleIndices.size > 0 &&
                                            selectedScheduleIndices.size < schedules.length
                                        }
                                        onChange={() => {
                                            if (selectedScheduleIndices.size === schedules.length) {
                                                setSelectedScheduleIndices(new Set());
                                            } else {
                                                setSelectedScheduleIndices(new Set(schedules.map((_, index) => index)));
                                            }
                                        }}
                                    />
                                }
                                label={
                                    <Typography variant="subtitle2" fontWeight="medium">
                                        Select All ({selectedScheduleIndices.size} of {schedules.length})
                                    </Typography>
                                }
                                sx={{ marginBottom: 1 }}
                            />
                            <Box
                                sx={{
                                    maxHeight: 300,
                                    overflow: 'auto',
                                    border: '1px solid',
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                    p: 1,
                                }}
                            >
                                <Stack spacing={1}>
                                    {schedules.map((schedule, index) => (
                                        <Paper
                                            key={index}
                                            sx={{
                                                p: 1.5,
                                                border: selectedScheduleIndices.has(index)
                                                    ? `2px solid ${DODGER_BLUE}`
                                                    : '2px solid transparent',
                                                backgroundColor: selectedScheduleIndices.has(index)
                                                    ? 'action.selected'
                                                    : 'background.paper',
                                                transition: 'all 0.2s ease-in-out',
                                            }}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        checked={selectedScheduleIndices.has(index)}
                                                        onChange={() => handleToggleSchedule(index)}
                                                    />
                                                }
                                                label={
                                                    <Box>
                                                        <Typography variant="body2" fontWeight="medium">
                                                            {schedule.scheduleName}
                                                        </Typography>
                                                        <Typography variant="caption" color="text.secondary">
                                                            {schedule.courses.length} course(s),{' '}
                                                            {schedule.customEvents.length} custom event(s)
                                                        </Typography>
                                                    </Box>
                                                }
                                            />
                                        </Paper>
                                    ))}
                                </Stack>
                            </Box>
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleExport} variant="contained" disabled={selectedScheduleIndices.size === 0}>
                        Export ({selectedScheduleIndices.size})
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
