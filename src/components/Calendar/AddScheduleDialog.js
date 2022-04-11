import React, { PureComponent } from 'react';
import {
    Tooltip,
    Button,
    Dialog,
    DialogTitle,
    DialogActions,
    DialogContent,
    TextField,
    FormControl,
} from '@material-ui/core';
import { Add } from '@material-ui/icons';
import { withStyles } from '@material-ui/core/styles';

const styles = () => ({
    addButton: {
        padding: '3px 7px',
        minWidth: 0,
        minHeight: 0,
    },
    textField: {
        marginBottom: '25px',
    },
});

class AddScheduleDialog extends PureComponent {
    state = {
        isOpen: false,
        scheduleName: '',
    };

    handleOpen = () => {
        this.setState({ isOpen: true });
    };

    handleClose = () => {
        this.setState({ isOpen: false });
    };

    handleNameChange = (event) => {
        this.setState({ scheduleName: event.target.value });
    };

    handleAdd = () => {
        this.props.onNameChange(this.state.scheduleName);
        this.setState({ isOpen: false });
    };

    render() {
        return (
            <>
                <Tooltip title="Add a Schedule">
                    <Button className={this.props.classes.addButton} variant="outlined" onClick={this.handleOpen}>
                        <Add />
                    </Button>
                </Tooltip>
                <Dialog open={this.state.isOpen} fullWidth>
                    <DialogTitle>Add a New Schedule</DialogTitle>
                    <DialogContent>
                        <FormControl fullWidth>
                            <TextField
                                className={this.props.classes.textField}
                                label="Name"
                                placeholder="Schedule 2"
                                onChange={this.handleNameChange}
                                required
                            />
                            <TextField
                                className={this.props.classes.textField}
                                label="Notes"
                                placeholder="An optional space to record thoughts about this schedule"
                                maxRows={5}
                                multiline
                            />
                        </FormControl>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose} color="primary">
                            Cancel
                        </Button>
                        <Button onClick={this.handleAdd} variant="contained" color="primary">
                            Add Schedule
                        </Button>
                    </DialogActions>
                </Dialog>
            </>
        );
    }
}

export default withStyles(styles)(AddScheduleDialog);
