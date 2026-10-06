import { updateScheduleNote } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box, TextField, Typography } from '@mui/material';
import { SCHEDULE_NOTE_MAX_LENGTH } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function ScheduleNoteBox() {
    const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore(
        useShallow((store) => ({
            fallbackMode: store.fallbackMode,
            getCurrentFallbackSchedule: store.getCurrentFallbackSchedule,
        }))
    );
    const [scheduleNote, setScheduleNote] = useState(
        fallbackMode
            ? getCurrentFallbackSchedule(AppStore.getCurrentScheduleIndex()).scheduleNote
            : AppStore.getCurrentScheduleNote()
    );
    const [scheduleIndex, setScheduleIndex] = useState(() => AppStore.getCurrentScheduleIndex());

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex]
    );

    useEffect(() => {
        const handleScheduleNoteChange = () => {
            const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore.getState();
            if (fallbackMode) {
                const idx = AppStore.getCurrentScheduleIndex();
                setScheduleNote(getCurrentFallbackSchedule(idx).scheduleNote);
            } else {
                setScheduleNote(AppStore.getCurrentScheduleNote());
            }
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
                color="secondary"
                variant="filled"
                label="Click here to start typing!"
                onChange={handleNoteChange}
                value={scheduleNote}
                inputProps={{
                    maxLength: SCHEDULE_NOTE_MAX_LENGTH,
                    style: { cursor: fallbackMode ? 'not-allowed' : 'text' },
                }}
                InputLabelProps={{
                    variant: 'filled',
                }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
                disabled={fallbackMode}
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: fallbackMode ? 'not-allowed' : 'text',
                    },
                }}
            />
        </Box>
    );
}
