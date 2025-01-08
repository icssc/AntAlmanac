import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import type { DialogProps } from '@mui/material';
import { useState } from 'react';

import { addSchedule } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useThemeStore } from '$stores/SettingsStore';

/**
 * Reusable component for the Schedule Name Field.
 */
function ScheduleNameField({
    name,
    errorMessage,
    onNameChange,
}: {
    name: string;
    errorMessage: string;
    onNameChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
    return (
        <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={onNameChange}
            error={Boolean(errorMessage)}
            helperText={errorMessage}
        />
    );
}

/**
 * Dialog with a text field to add a schedule.
 */
function AddScheduleDialog({ onClose, onKeyDown, ...props }: DialogProps) {
    const isDark = useThemeStore((store) => store.isDark);

    const [name, setName] = useState(AppStore.getDefaultScheduleName());
    const [errorMessage, setErrorMessage] = useState('');

    const handleCancel = () => {
        onClose?.({}, 'escapeKeyDown');
    };

    const handleNameChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setName(event.target.value);
        setErrorMessage('');
    };

    const submitName = () => {
        const existingNames = AppStore.schedule.getScheduleNames();
        if (existingNames.includes(name.trim())) {
            setErrorMessage('Schedule name already exists');
            return;
        }
        addSchedule(name);
        setName(AppStore.schedule.getDefaultScheduleName());
        setErrorMessage('');
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
                    <ScheduleNameField
                        name={name}
                        errorMessage={errorMessage}
                        onNameChange={handleNameChange}
                    />
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
