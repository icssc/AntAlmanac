import React, { Fragment, PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import InputMask from 'react-input-mask';
import { Button, Popover, TextField, Typography } from '@material-ui/core';
import { openSnackbar } from '../../actions/AppStoreActions';

const emailRegex = RegExp(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i);
const phoneNumberRegex = RegExp(/\d{10}/);

const styles = (theme) => ({
    container: {
        padding: theme.spacing.unit,
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing.unit,
    },
});

class OpenSpotAlertPopover extends PureComponent {
    state = {
        anchorElement: null,
        email: window.localStorage.getItem('email') || '',
        phoneNumber: window.localStorage.getItem('phoneNumber') || '',
        invalidInput: false,
        invalidInputMessage: '',
    };

    handlePhoneNumberChange = (event) => {
        this.setState({ phoneNumber: event.target.value });
    };

    handleEmailChange = (event) => {
        this.setState({ email: event.target.value });
    };

    registerForAlerts = async (event) => {
        const params = {
            phoneNumber: this.state.phoneNumber.replace(/\s/g, ''),
            email: this.state.email,
            sectionCode: this.props.sectionCode,
        };
        const validEmail = emailRegex.test(params.email);
        const validPhoneNumber = phoneNumberRegex.test(params.phoneNumber);

        if (validEmail && validPhoneNumber) {
            const response = await fetch('/api/registerAlerts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(params),
            });

            if (response.status === 200) {
                window.localStorage.setItem('email', this.state.email);
                window.localStorage.setItem(
                    'phoneNumber',
                    this.state.phoneNumber
                );
                this.setState({ anchorElement: null, invalidInput: false });
                openSnackbar(
                    'success',
                    `Added to watch list for ${params.sectionCode}`
                );
                //TODO: Dialog with the message about txt messages paywall etc etc
            } else {
                //TODO: Error state
            }
        } else if (validEmail) {
            this.setState({
                invalidInput: true,
                invalidInputMessage: 'Please enter a valid phone number',
            });
        } else if (validPhoneNumber) {
            this.setState({
                invalidInput: true,
                invalidInputMessage: 'Please enter a valid email',
            });
        } else {
            this.setState({
                invalidInput: true,
                invalidInputMessage:
                    'Please enter a valid email and phone number',
            });
        }
    };

    render() {
        const { classes, status } = this.props;

        return (
            <Fragment>
                <Button
                    variant="outlined"
                    color="inherit"
                    onClick={(event) =>
                        this.setState({ anchorElement: event.currentTarget })
                    }
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
                        {this.state.invalidInput ? (
                            <Typography>
                                {this.state.invalidInputMessage}
                            </Typography>
                        ) : null}
                        <div>
                            <InputMask
                                maskChar={null}
                                mask="999 999 9999"
                                value={this.state.phoneNumber}
                                onChange={this.handlePhoneNumberChange}
                            >
                                {() => (
                                    <TextField
                                        label="Phone number"
                                        margin="dense"
                                        type="text"
                                    />
                                )}
                            </InputMask>
                        </div>
                        <div>
                            <TextField
                                value={this.state.email}
                                margin="dense"
                                onChange={this.handleEmailChange}
                                label="Email"
                                type="text"
                            />
                        </div>
                        <div className={classes.buttonContainer}>
                            <Button
                                onClick={this.registerForAlerts}
                                variant="outlined"
                                color="primary"
                            >
                                Notify me
                            </Button>
                        </div>
                    </div>
                </Popover>
            </Fragment>
        );
    }
}

OpenSpotAlertPopover.propTypes = {
    classes: PropTypes.object.isRequired,
    sectionCode: PropTypes.string.isRequired,
};

export default withStyles(styles)(OpenSpotAlertPopover);
