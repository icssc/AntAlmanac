import React, { PureComponent, Fragment } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import InputMask from 'react-input-mask';
import { TextField, Popover, Button, Typography } from '@material-ui/core';

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
    };

    handlePhoneNumberChange = (event) => {
        this.setState({ phoneNumber: event.target.value });
    };

    handleEmailChange = (event) => {
        this.setState({ email: event.target.value });
    };

    registerForAlerts = (event) => {};

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
                    onClose={() => this.setState({ anchorElement: null })}
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
