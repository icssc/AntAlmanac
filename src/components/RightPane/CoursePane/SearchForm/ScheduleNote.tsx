import { Paper, TextField, withStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React, { useEffect, useState } from 'react';

import { editScheduleNote } from '../../../../actions/AppStoreActions';

const styles = {
    container: {
        padding: '10px',
        marginLeft: '8px',
        marginRight: '8px',
        width: '100%',
    }
};

interface ScheduleNoteProps {
    classes: ClassNameMap;
    note: string;
    scheduleIndex: number;
}

const ScheduleNote = ({ classes, note, scheduleIndex }: ScheduleNoteProps) => {
    const [scheduleNote, setScheduleNote] = useState(note);
    const NOTE_MAX_LEN = 5000;

    const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScheduleNote(event.target.value);
        editScheduleNote(event.target.value, scheduleIndex);
    };

    // If the user changes the note in another place (like the Edit Schedule modal),
    // reflect those changes
    useEffect(() => {
        setScheduleNote(note);
    }, [note]);

    return (
        <Paper className={classes.container}>
            <TextField
                type="text"
                placeholder="This schedule does not have any notes! Click here to start typing!"
                onChange={handleNoteChange}
                value={scheduleNote}
                inputProps={{ maxLength: NOTE_MAX_LEN }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
            />
        </Paper>
    );
};

export default withStyles(styles)(ScheduleNote);
