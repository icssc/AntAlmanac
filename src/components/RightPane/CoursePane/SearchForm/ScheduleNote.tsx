import { Paper, TextField, withStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React, { useEffect, useState } from 'react';

import { editScheduleNote  } from '../../../../actions/AppStoreActions';
import AppStore from '../../../../stores/AppStore';

const styles = {
    container: {
        padding: 10,
        marginLeft: '8px',
        marginRight: '8px',
        width: '100%',
    }
};
interface ScheduleNoteProps {
    classes: ClassNameMap;
}

const ScheduleNote = ({ classes }: ScheduleNoteProps) => {
    const [scheduleNotes, setScheduleNotes] = useState(AppStore.getScheduleNotes());
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());
    const [scheduleNote, setScheduleNote] = useState(scheduleNotes[scheduleIndex]);
    const NOTE_MAX_LEN = 5000;

    const updateScheduleNotes = () => {
        setScheduleNotes(AppStore.getScheduleNotes());
    };

    const updateScheduleIndex = () => {
        setScheduleIndex(AppStore.getCurrentScheduleIndex());
    };

    const handleNoteChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setScheduleNote(event.target.value);
        editScheduleNote(event.target.value, scheduleIndex);
    };

    useEffect(() => {
        AppStore.on('scheduleNotesChange', updateScheduleNotes);
        AppStore.on('currentScheduleIndexChange', updateScheduleIndex);
        return () => {
            AppStore.removeListener('scheduleNotesChange', updateScheduleNotes);
            AppStore.removeListener('currentScheduleIndexChange', updateScheduleIndex);
        };
    }, []);

    return (
        <Paper className={classes.container}>
            <TextField
                type="text"
                placeholder="This schedule does not have any notes! Click here to type a note!"
                onChange={handleNoteChange}
                value={scheduleNote}
                inputProps={{ maxLength: NOTE_MAX_LEN }}
                InputProps={{ disableUnderline: true }}
                fullWidth
                multiline
            />
            {/* <div style={{ whiteSpace: 'pre-line' }}>
                {scheduleNotes[scheduleIndex] === ''
                    ? 'This schedule does not have any notes! To add notes to this schedule, click on the "Edit schedule" button in the top left corner!'
                    : scheduleNotes[scheduleIndex]}
            </div> */}
        </Paper>
    );
};

export default withStyles(styles)(ScheduleNote);
