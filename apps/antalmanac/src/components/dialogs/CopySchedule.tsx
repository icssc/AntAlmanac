import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    MenuItem,
    Select,
    type DialogProps,
} from '@mui/material';
import { SelectChangeEvent } from '@mui/material';
import { useState, useEffect, useCallback } from 'react';

import { copySchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

interface CopyScheduleDialogProps extends DialogProps {
    index: number;
}

function CopyScheduleDialog(props: CopyScheduleDialogProps) {
    const { index } = props;
    const { onClose } = props; // destructured separately for memoization.
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [selectedSchedule, setSelectedSchedule] = useState<number>(0);

    const handleScheduleChange = useCallback((event: SelectChangeEvent<number>) => {
        setSelectedSchedule(event.target.value as number);
    }, []);

    const handleCancel = useCallback(() => {
        onClose?.({}, 'escapeKeyDown');
    }, [onClose]);

    const handleCopy = useCallback(() => {
        if (selectedSchedule !== scheduleNames.length) {
            copySchedule(selectedSchedule);
        } else {
            scheduleNames.forEach((_, scheduleIndex) => {
                if (scheduleIndex !== index) {
                    copySchedule(scheduleIndex);
                }
            });
        }
        onClose?.({}, 'escapeKeyDown');
    }, [index, onClose, selectedSchedule, scheduleNames]);

    const handleScheduleNamesChange = useCallback(() => {
        setScheduleNames([...AppStore.getScheduleNames()]);
    }, []);

    useEffect(() => {
        AppStore.on('scheduleNamesChange', handleScheduleNamesChange);

        return () => {
            AppStore.off('scheduleNamesChange', handleScheduleNamesChange);
        };
    }, [handleScheduleNamesChange]);

    return (
        <Dialog onClose={onClose} {...props}>
            <DialogTitle>Copy To Schedule</DialogTitle>

            <DialogContent>
                <Box padding={1}>
                    <Select fullWidth value={selectedSchedule} onChange={handleScheduleChange}>
                        {scheduleNames.map((name, idx) => (
                            <MenuItem key={idx} value={idx} disabled={index === idx}>
                                {name}
                            </MenuItem>
                        ))}
                        <MenuItem value={scheduleNames.length}>Copy to All Schedules</MenuItem>
                    </Select>
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleCopy} variant="contained" color="primary">
                    Copy Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default CopyScheduleDialog;
