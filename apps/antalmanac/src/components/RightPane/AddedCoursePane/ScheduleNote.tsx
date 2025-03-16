import { Box, Typography, TextField } from '@mui/material';
import { useState, useCallback, useEffect } from 'react';

import { updateScheduleNote } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

const NOTE_MAX_LEN = 5000;

export function ScheduleNote() {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());
    const [scheduleNote, setScheduleNote] = useState(
        skeletonMode ? AppStore.getCurrentSkeletonSchedule().scheduleNote : AppStore.getCurrentScheduleNote()
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
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

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
                    style: { cursor: skeletonMode ? 'not-allowed' : 'text' },
                }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
                disabled={skeletonMode}
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: skeletonMode ? 'not-allowed' : 'text',
                    },
                }}
            />
        </Box>
    );
}
