import { updateScheduleNote } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import AppStore from '$stores/AppStore';
import { useFallbackStore } from '$stores/FallbackStore';
import { useSessionStore } from '$stores/SessionStore';
import { useAutoSaveStore } from '$stores/SettingsStore';
import { Box, Link, TextField, Typography } from '@mui/material';
import { SCHEDULE_NOTE_MAX_LENGTH } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'unsaved' | 'signedOut';

const SAVE_STATUS_TEXT: Record<Exclude<SaveStatus, 'idle' | 'signedOut'>, string> = {
    saving: 'Saving…',
    saved: '✓ Saved',
    unsaved: 'Not saved — click Save at the top',
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
    const isSignedIn = useSessionStore((store) => store.sessionIsValid && Boolean(store.userId));
    const autoSave = useAutoSaveStore((store) => store.autoSave);

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            if (!isSignedIn) {
                setSaveStatus('signedOut');
            } else {
                setSaveStatus(autoSave ? 'saving' : 'unsaved');
            }
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex, isSignedIn, autoSave]
    );

    useEffect(() => {
        // A failed save; a successful one is reported by 'scheduleSaved' below, which fires first.
        const handleNoteAutoSaveEnd = (saved: boolean) =>
            setSaveStatus((status) => (status === 'saving' && !saved ? 'unsaved' : status));

        // Fires for any successful save (header Save, course autosave, or note autosave). Only
        // trust it when the note text it saved is still the current one — a save that started
        // before the latest keystroke doesn't mean that keystroke made it to the server.
        const handleScheduleSaved = (noteIsCurrent: boolean) => {
            if (!noteIsCurrent) return;
            setSaveStatus((status) => (status === 'idle' || status === 'signedOut' ? status : 'saved'));
        };

        AppStore.on('noteAutoSaveEnd', handleNoteAutoSaveEnd);
        AppStore.on('scheduleSaved', handleScheduleSaved);

        return () => {
            AppStore.off('noteAutoSaveEnd', handleNoteAutoSaveEnd);
            AppStore.off('scheduleSaved', handleScheduleSaved);
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
            setSaveStatus('idle');
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
                    role="status"
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
