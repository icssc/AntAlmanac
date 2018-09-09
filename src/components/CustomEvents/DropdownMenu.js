import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import TextField from '@material-ui/core/TextField';

const styles = () => ({
    textField: {
        minWidth: 120
    }
});

function TimePickers(props) {
    const { classes } = props;

    return (
        <form noValidate>
            <TextField
                onChange={props.onTimeChange}
                id="time"
                label={props.label}
                type="time"
                defaultValue="07:30"
                InputLabelProps={{
                    shrink: true,
                }}
                className={classes.textField}
                inputProps={{
                    step: 300
                }}
            />
        </form>
    );
}

export default withStyles(styles)(TimePickers);