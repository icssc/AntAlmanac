import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import InputMask from 'react-input-mask';
import { Button, Popover, TextField, Typography } from '@material-ui/core';
import { openSnackbar } from '../../../actions/AppStoreActions';
import { REGISTER_NOTIFICATIONS_ENDPOINT } from '../../../api/endpoints';
import dispatcher from '../../../dispatcher';

const phoneNumberRegex = RegExp(/\d{10}/);

const styles = (theme) => ({
    container: {
        padding: theme.spacing(),
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(),
    },
});

class OpenSpotAlertPopover extends PureComponent {
    state = {
        anchorElement: null,
        phoneNumber: window.localStorage.getItem('phoneNumber') || '',
        invalidInput: false,
        invalidInputMessage: '',
    };

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (
            (!prevState.anchorElement && this.state.anchorElement) ||
            (prevState.anchorElement && !this.state.anchorElement)
        ) {
            dispatcher.dispatch({
                type: 'TOGGLE_OPEN_SPOT_ALERT',
            });
        }
    }

    handlePhoneNumberChange = (event) => {
        this.setState({ phoneNumber: event.target.value });
    };

    registerForAlerts = async () => {
        const params = {
            phoneNumber: this.state.phoneNumber.replace(/\s/g, ''),
            sectionCode: this.props.sectionCode,
            courseTitle: `${this.props.courseNumber} ${this.props.courseTitle}`,
        };

        const validPhoneNumber = phoneNumberRegex.test(params.phoneNumber);

        if (validPhoneNumber) {
            const response = await fetch(REGISTER_NOTIFICATIONS_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (response.status === 200) {
                window.localStorage.setItem('phoneNumber', this.state.phoneNumber);
                this.setState({ anchorElement: null, invalidInput: false });
                openSnackbar('success', `Added to watch list for ${params.sectionCode}`);
                //TODO: Dialog with the message about txt messages paywall etc etc
            } else {
                //TODO: Error state
            }
        } else {
            this.setState({
                invalidInput: true,
                invalidInputMessage: 'Please enter a valid phone number',
            });
        }
    };

    render() {
        const { classes, status } = this.props;

        return (
            <>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={(event) => this.setState({ anchorElement: event.currentTarget })}
                >
                    {status}
                </Button>
                <Popover
                    anchorEl={this.state.anchorElement}
                    open={Boolean(this.state.anchorElement)}
                    onClose={() =>
                        this.setState({
                            anchorElement: null,
                            invalidInput: false,
                        })
                    }
                    anchorOrigin={{
                        vertical: 'top',
                        horizontal: 'left',
                    }}
                    transformOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                    }}
                >
                    <div className={classes.container}>
                        <Typography>Get notified when a spot opens!</Typography>
                        {this.state.invalidInput ? <Typography>{this.state.invalidInputMessage}</Typography> : null}
                        <div>
                            <InputMask
                                maskChar={null}
                                mask="999 999 9999"
                                value={this.state.phoneNumber}
                                onChange={this.handlePhoneNumberChange}
                            >
                                {() => <TextField label="Phone number" margin="dense" type="text" />}
                            </InputMask>
                        </div>
                        <div className={classes.buttonContainer}>
                            <Button onClick={this.registerForAlerts} variant="outlined" color="primary">
                                Notify me
                            </Button>
                        </div>
                    </div>
                </Popover>
            </>
        );
    }
}

OpenSpotAlertPopover.propTypes = {
    courseTitle: PropTypes.string.isRequired,
    courseNumber: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    sectionCode: PropTypes.string.isRequired,
};

export default withStyles(styles)(OpenSpotAlertPopover);
