import { updateScheduleNote } from '$actions/AppStoreActions';
import { useAppStoreScheduleIndex, useScheduleNoteSnapshot } from '$hooks/useAppStoreSchedule';
import { Box, TextField, Typography } from '@mui/material';
import { SCHEDULE_NOTE_MAX_LENGTH } from '@packages/antalmanac-types';
import { useCallback, useEffect, useState } from 'react';

type ScheduleNoteBoxProps = {
    scheduleNote?: string;
};

export function ScheduleNoteBox({ scheduleNote: scheduleNoteProp }: ScheduleNoteBoxProps) {
    if (scheduleNoteProp !== undefined) {
        return <ScheduleNoteBoxReadOnly scheduleNote={scheduleNoteProp} />;
    }

    return <ScheduleNoteBoxEditable />;
}

function ScheduleNoteBoxReadOnly({ scheduleNote }: { scheduleNote: string }) {
    return (
        <Box>
            <Typography variant="h6">Schedule Notes</Typography>

            <TextField
                type="text"
                color="secondary"
                variant="filled"
                label="Click here to start typing!"
                value={scheduleNote}
                inputProps={{
                    maxLength: SCHEDULE_NOTE_MAX_LENGTH,
                    style: { cursor: 'not-allowed' },
                }}
                InputLabelProps={{
                    variant: 'filled',
                }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
                disabled
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: 'not-allowed',
                    },
                }}
            />
        </Box>
    );
}

function ScheduleNoteBoxEditable() {
    const scheduleIndex = useAppStoreScheduleIndex();
    const storeScheduleNote = useScheduleNoteSnapshot();
    const [scheduleNote, setScheduleNote] = useState(storeScheduleNote);

    useEffect(() => {
        setScheduleNote(storeScheduleNote);
    }, [storeScheduleNote]);

    const handleNoteChange = useCallback(
        (event: React.ChangeEvent<HTMLTextAreaElement>) => {
            setScheduleNote(event.target.value);
            updateScheduleNote(event.target.value, scheduleIndex);
        },
        [scheduleIndex]
    );

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
                    style: { cursor: 'text' },
                }}
                InputLabelProps={{
                    variant: 'filled',
                }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
                sx={{
                    '& .MuiInputBase-root': {
                        cursor: 'text',
                    },
                }}
            />
        </Box>
    );
}
