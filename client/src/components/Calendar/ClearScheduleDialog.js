import React, { Fragment, PureComponent } from 'react';

import {
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    FormControlLabel,
    FormGroup,
    Typography,
} from '@material-ui/core';
import { Delete } from '@material-ui/icons';
import { clearSchedules } from '../../actions/AppStoreActions';
import ReactGA from 'react-ga';

export default class ClearScheduleDialog extends PureComponent {
    state = {
        open: false,
        one: this.props.currentScheduleIndex === 0,
        two: this.props.currentScheduleIndex === 1,
        three: this.props.currentScheduleIndex === 2,
        four: this.props.currentScheduleIndex === 3,
    };

    handleClickOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({
            open: false,
            one: false,
            two: false,
            three: false,
            four: false,
        });
        this.props.handleSubmenuClose();
    };

    handleClear = () => {
        let toDelete = [];

        if (this.state.one) {
            toDelete.push(0);
        }
        if (this.state.two) {
            toDelete.push(1);
        }
        if (this.state.three) {
            toDelete.push(2);
        }
        if (this.state.four) {
            toDelete.push(3);
        }
        ReactGA.event({
            category: 'antalmanac-rewrite',
            action: 'Click Clear button',
        });
        clearSchedules(toDelete);
        this.handleClose();
    };

    handleChange = (name) => (event) => {
        this.setState({ [name]: event.target.checked });
    };

    render() {
        return (
            <Fragment>
                <Button onClick={this.handleClickOpen} disableRipple={true}>
                    <Delete /> Clear
                </Button>
                <Dialog
                    maxWidth="xs"
                    open={this.state.open}
                    onClose={this.handleClose}
                >
                    <DialogTitle>Select a Schedule to Clear</DialogTitle>
                    <DialogContent>
                        <div>
                            <Typography variant="body1">
                                You cannot undo this action,
                                <br />
                                but you can load your schedule again.
                            </Typography>
                            <FormGroup>
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.one}
                                            onChange={this.handleChange('one')}
                                        />
                                    }
                                    value="one"
                                    label="Schedule 1"
                                    color="primary"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.two}
                                            onChange={this.handleChange('two')}
                                        />
                                    }
                                    value="two"
                                    label="Schedule 2"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.three}
                                            onChange={this.handleChange(
                                                'three'
                                            )}
                                        />
                                    }
                                    value="three"
                                    label="Schedule 3"
                                />
                                <FormControlLabel
                                    control={
                                        <Checkbox
                                            checked={this.state.four}
                                            onChange={this.handleChange('four')}
                                        />
                                    }
                                    value="four"
                                    label="Schedule 4"
                                />
                            </FormGroup>
                        </div>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={this.handleClose}>Cancel</Button>
                        <Button color="primary" onClick={this.handleClear}>
                            Clear
                        </Button>
                    </DialogActions>
                </Dialog>
            </Fragment>
        );
    }
}
