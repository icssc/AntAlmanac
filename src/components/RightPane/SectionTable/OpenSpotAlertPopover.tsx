import { Button, Popover, TextField, Typography } from '@material-ui/core';
import { Theme,withStyles } from '@material-ui/core/styles';
import { ClassNameMap,Styles } from '@material-ui/core/styles/withStyles';
import React, { PureComponent } from 'react';
import InputMask from 'react-input-mask';

import { openSnackbar } from '../../../actions/AppStoreActions';
import { REGISTER_NOTIFICATIONS_ENDPOINT } from '../../../api/endpoints';
import RightPaneStore from '../RightPaneStore';

const phoneNumberRegex = RegExp(/\d{10}/);

const styles: Styles<Theme, object> = (theme) => ({
    container: {
        padding: theme.spacing(),
    },
    buttonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: theme.spacing(),
    },
});

export interface OpenSpotAlertPopoverProps {
    classes: ClassNameMap;
    status: string;
    sectionCode: string;
    courseNumber: string;
    courseTitle: string;
}

interface OpenSpotAlertPopoverState {
    anchorElement: HTMLElement | null;
    phoneNumber: string;
    invalidInput: boolean;
    invalidInputMessage: string;
}

class OpenSpotAlertPopover extends PureComponent<OpenSpotAlertPopoverProps, OpenSpotAlertPopoverState> {
    state = {
        anchorElement: null,
        phoneNumber: window.localStorage.getItem('phoneNumber') || '',
        invalidInput: false,
        invalidInputMessage: '',
    };

    componentDidUpdate(prevProps: OpenSpotAlertPopoverProps, prevState: OpenSpotAlertPopoverState) {
        if (
            (!prevState.anchorElement && this.state.anchorElement) ||
            (prevState.anchorElement && !this.state.anchorElement)
        ) {
            RightPaneStore.toggleOpenSpotAlert();
        }
    }

    handlePhoneNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
                // @ts-ignore
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
                                /* @ts-ignore The type interface for this library uses "maskPlaceholder" while the library itself uses "maskChar"*/
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

export default withStyles(styles)(OpenSpotAlertPopover);
