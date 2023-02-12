import { Paper, withStyles } from '@material-ui/core';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import React, { useEffect, useState } from 'react';

import AppStore from '../../../../stores/AppStore';

const styles = {
    container: {
        padding: 12,
        marginBottom: '10px',
        marginRight: '5px',
    },
    heading: {
        marginTop: 2,
    },
};
interface ScheduleNoteProps {
    classes: ClassNameMap;
}

const ScheduleNote = ({ classes }: ScheduleNoteProps) => {
    const [scheduleNames, setScheduleNames] = useState(AppStore.getScheduleNames());
    const [scheduleNotes, setScheduleNotes] = useState(AppStore.getScheduleNotes());
    const [scheduleIndex, setScheduleIndex] = useState(AppStore.getCurrentScheduleIndex());

    const updateScheduleNames = () => {
        setScheduleNames(AppStore.getScheduleNames());
    };

    const updateScheduleNotes = () => {
        setScheduleNotes(AppStore.getScheduleNotes());
    };

    const updateScheduleIndex = () => {
        setScheduleIndex(AppStore.getCurrentScheduleIndex());
    };

    useEffect(() => {
        AppStore.on('scheduleNamesChange', updateScheduleNames);
        AppStore.on('scheduleNotesChange', updateScheduleNotes);
        AppStore.on('currentScheduleIndexChange', updateScheduleIndex);
        return () => {
            AppStore.removeListener('scheduleNamesChange', updateScheduleNames);
            AppStore.removeListener('scheduleNotesChange', updateScheduleNotes);
            AppStore.removeListener('currentScheduleIndexChange', updateScheduleIndex);
        };
    }, []);

    return (
        <Paper variant="outlined" className={classes.container}>
            <h2 className={classes.heading}>{scheduleNames[scheduleIndex]} Notes</h2>
            <div style={{ whiteSpace: 'pre-line' }}>
                {scheduleNotes[scheduleIndex] === ''
                    ? 'This schedule does not have any notes! To add notes to this schedule, click on the "Edit schedule" button in the top left corner!'
                    : scheduleNotes[scheduleIndex]}
            </div>
        </Paper>
    );
};

export default withStyles(styles)(ScheduleNote);
