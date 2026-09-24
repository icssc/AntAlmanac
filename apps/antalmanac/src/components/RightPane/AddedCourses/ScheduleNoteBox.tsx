import actionTypesStore from '$actions/ActionTypesStore';
import { updateScheduleNote } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { useSessionStore } from '$stores/SessionStore';
import { Box, Link, TextField, Typography } from '@mui/material';
import { SCHEDULE_NOTE_MAX_LENGTH } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed' | 'signedOut';

const SAVE_STATUS_TEXT: Record<Exclude<SaveStatus, 'idle' | 'signedOut'>, string> = {
    saving: 'Saving…',
    saved: '✓ Saved',
    failed: 'Not saved',
};

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
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            setSaveStatus(sessionIsValid ? 'saving' : 'signedOut');
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex, sessionIsValid]
    );

    useEffect(() => {
        const handleScheduleSaved = () => setSaveStatus((status) => (status === 'idle' ? status : 'saved'));
        // Autosave ends without a 'scheduleSaved' event when the request fails.
        const handleAutoSaveEnd = () => setSaveStatus((status) => (status === 'saving' ? 'failed' : status));

        AppStore.on('scheduleSaved', handleScheduleSaved);
        actionTypesStore.on('autoSaveEnd', handleAutoSaveEnd);

        return () => {
            AppStore.off('scheduleSaved', handleScheduleSaved);
            actionTypesStore.off('autoSaveEnd', handleAutoSaveEnd);
        };
    }, []);

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

            {saveStatus !== 'idle' && (
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', textAlign: 'right', marginTop: 0.5 }}
                >
                    {saveStatus === 'signedOut' ? (
                        <Link component="button" variant="caption" onClick={() => setOpenSignInDialog(true)}>
                            Sign in to save
                        </Link>
                    ) : (
                        SAVE_STATUS_TEXT[saveStatus]
                    )}
                </Typography>
            )}

            <SignInDialog open={openSignInDialog} onClose={() => setOpenSignInDialog(false)} feature="Save" />
        </Box>
    );
}
