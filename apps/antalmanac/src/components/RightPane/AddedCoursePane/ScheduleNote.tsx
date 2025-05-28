import { Box, Typography, TextField } from '@mui/material';
import { useState, useCallback, useEffect } from 'react';

import { updateScheduleNote } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';

const NOTE_MAX_LEN = 5000;

export function ScheduleNote() {
    const { fallback, fallbackSchedules } = useFallbackStore();

    const [scheduleNote, setScheduleNote] = useState(
        fallback
            ? fallbackSchedules.at(AppStore.getCurrentScheduleIndex())?.scheduleNote
            : AppStore.getCurrentScheduleNote()
    );
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex]
    );

    useEffect(() => {
        const handleScheduleNoteChange = () => {
            setScheduleNote(AppStore.getCurrentScheduleNote());
        };

        const handleScheduleIndexChange = () => {
            setScheduleIndex(AppStore.getCurrentScheduleIndex());
        };

        AppStore.on('scheduleNotesChange', handleScheduleNoteChange);
        AppStore.on('currentScheduleIndexChange', handleScheduleIndexChange);

        return () => {
            AppStore.off('scheduleNotesChange', handleScheduleNoteChange);
            AppStore.off('currentScheduleIndexChange', handleScheduleIndexChange);
        };
    }, []);

    return (
        <Box>
            <Typography variant="h6">Schedule Notes</Typography>

            <TextField
                type="text"
                variant="filled"
                label="Click here to start typing!"
                onChange={handleNoteChange}
                value={scheduleNote}
                inputProps={{
                    maxLength: NOTE_MAX_LEN,
                    style: { cursor: fallback ? 'not-allowed' : 'text' },
                }}
                InputProps={{ disableUnderline: true }}
                InputLabelProps={{
                    variant: 'filled',
                }}
                fullWidth
                multiline
                disabled={fallback}
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: fallback ? 'not-allowed' : 'text',
                    },
                }}
            />
        </Box>
    );
}
