import React, { Fragment } from 'react';
import { CheckCircle, Error, Close, Warning } from '@material-ui/icons';
import { green, amber } from '@material-ui/core/colors';
import { IconButton, SnackbarContent } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import LoadButton from './LoadButton';
import SaveButton from './SaveButton';

const iconVariants = {
    success: CheckCircle,
    warning: Warning,
    error: Error,
};

const snackbarStyles = (theme) => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
        opacity: 0.9,
        marginRight: theme.spacing.unit,
    },
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

const SnackBarMessageDisplay = withStyles(snackbarStyles)((props) => {
    const { classes, message, onClose, variant, ...other } = props;
    const Icon = iconVariants[variant];

    return (
        <SnackbarContent
            className={classes[variant]}
            message={
                <span className={classes.message}>
                    <Icon className={classes.icon} />
                    {message}
                </span>
            }
            action={[
                <IconButton
                    key="close"
                    color="inherit"
                    className={classes.close}
                    onClick={onClose}
                >
                    <Close className={classes.icon} />
                </IconButton>,
            ]}
            {...other}
        />
    );
});

class LoadSaveScheduleFunctionality extends React.Component {
    componentDidMount = async () => {
        // if (typeof Storage !== 'undefined') {
        //     const savedUserID = window.localStorage.getItem('userID');
        //
        //     if (savedUserID != null) {
        //         const userData = await loadUserData(savedUserID);
        //         if (userData !== -1) {
        //             if (!userData.canceledClass)
        //                 this.setState({
        //                     message:
        //                         'Schedule that was saved under ' +
        //                         savedUserID +
        //                         ' loaded.',
        //                     open: true,
        //                     variant: 'success',
        //                 });
        //             else
        //                 this.setState({
        //                     message:
        //                         'Schedule that was saved under ' +
        //                         savedUserID +
        //                         ' loaded; however, one or more classes have been cancelled!',
        //                     variant: 'warning',
        //                     open: true,
        //                 });
        //
        //             await this.props.onLoad(userData);
        //         }
        //     }
        // }
    };

    render() {
        return (
            <Fragment>
                <LoadButton></LoadButton>
                <SaveButton />
            </Fragment>
        );
    }
}

export default LoadSaveScheduleFunctionality;
