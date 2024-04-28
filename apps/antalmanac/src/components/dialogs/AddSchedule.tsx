import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { DialogProps } from '@mui/material';
import { useState } from 'react';

import { addSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

/**
 * Dialog with a text field to add a schedule.
 */
function AddScheduleDialog({ onClose, onKeyDown, ...props }: DialogProps) {
    const isDark = useThemeStore((store) => store.isDark);

    const [name, setName] = useState(AppStore.getDefaultScheduleName());

    const handleCancel = () => {
        onClose?.({}, 'escapeKeyDown');
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
    };

    const submitName = () => {
        addSchedule(name);
        setName(AppStore.schedule.getDefaultScheduleName());
        onClose?.({}, 'escapeKeyDown');
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);

        switch (event.key) {
            case 'Enter': {
                event.stopPropagation();
                event.preventDefault();
                submitName();
                break;
            }

            case 'Escape': {
                onClose?.({}, 'escapeKeyDown');
                break;
            }
        }
    };

    return (
        <Dialog onKeyDown={handleKeyDown} {...props}>
            <DialogTitle>Add Schedule</DialogTitle>

            <DialogContent>
                <Box padding={1}>
                    <TextField fullWidth label="Name" onChange={handleNameChange} value={name} />
                </Box>
            </DialogContent>

            <DialogActions>
                <Button onClick={handleCancel} color={isDark ? 'secondary' : 'primary'}>
                    Cancel
                </Button>
                <Button onClick={submitName} variant="contained" color="primary" disabled={name.trim() === ''}>
                    Add Schedule
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default AddScheduleDialog;
