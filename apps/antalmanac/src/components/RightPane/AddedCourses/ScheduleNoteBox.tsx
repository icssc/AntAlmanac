import { updateScheduleNote } from '$actions/AppStoreActions';
import { useScheduleViewSource } from '$lib/schedule/ScheduleViewContext';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { Box, TextField, Typography } from '@mui/material';
import { SCHEDULE_NOTE_MAX_LENGTH } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export function ScheduleNoteBox() {
    const scheduleSource = useScheduleViewSource();
    const isReadonly = scheduleSource.readonly;
    const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore(
        useShallow((store) => ({
            fallbackMode: store.fallbackMode,
            getCurrentFallbackSchedule: store.getCurrentFallbackSchedule,
        }))
    );
    const [scheduleNote, setScheduleNote] = useState(() => {
        if (fallbackMode) {
            return getCurrentFallbackSchedule(AppStore.getCurrentScheduleIndex()).scheduleNote;
        }
        return scheduleSource.getCurrentScheduleNote();
    });
    const [scheduleIndex, setScheduleIndex] = useState(scheduleSource.getCurrentScheduleIndex());

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex]
    );

    useEffect(() => {
        const syncFromSource = () => {
            const { fallbackMode, getCurrentFallbackSchedule } = useFallbackStore.getState();
            if (fallbackMode) {
                const idx = AppStore.getCurrentScheduleIndex();
                setScheduleNote(getCurrentFallbackSchedule(idx).scheduleNote);
            } else {
                setScheduleNote(scheduleSource.getCurrentScheduleNote());
            }
            setScheduleIndex(scheduleSource.getCurrentScheduleIndex());
        };

        syncFromSource();
        return scheduleSource.subscribe(syncFromSource);
    }, [scheduleSource]);

    const disabled = fallbackMode || isReadonly;

    return (
        <Box>
            <Typography variant="h6">Schedule Notes</Typography>

            <TextField
                type="text"
                color="secondary"
                variant="filled"
                label={disabled ? undefined : 'Click here to start typing!'}
                onChange={handleNoteChange}
                value={scheduleNote}
                inputProps={{
                    maxLength: SCHEDULE_NOTE_MAX_LENGTH,
                    style: { cursor: disabled ? 'not-allowed' : 'text' },
                }}
                InputLabelProps={{
                    variant: 'filled',
                }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
                disabled={disabled}
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: disabled ? 'not-allowed' : 'text',
                    },
                }}
            />
        </Box>
    );
}
