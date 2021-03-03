import React, { PureComponent } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import WarningIcon from '@material-ui/icons/Warning';
import AppStore from '../../stores/AppStore';
import { withStyles } from '@material-ui/core/styles';
import { withSnackbar } from 'notistack';
import { Fragment } from 'react';

const variantIcon = {
    success: CheckCircleIcon,
    warning: WarningIcon,
    error: ErrorIcon,
    info: InfoIcon,
};

const styles = (theme) => ({
    success: {
        backgroundColor: green[600],
    },
    error: {
        backgroundColor: theme.palette.error.dark,
    },
    info: {
        backgroundColor: theme.palette.primary.main,
    },
    warning: {
        backgroundColor: amber[700],
    },
    icon: {
        fontSize: 20,
        opacity: 0.9,
        marginRight: theme.spacing,
    },
    iconVariant: {},
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

class NotificationSnackbar extends PureComponent {
    state = {
        message: '',
        variant: 'info',
        duration: 3000,
    };

    openSnackbar = () => {
        this.props.enqueueSnackbar(AppStore.getSnackbarMessage(), {
            variant: AppStore.getSnackbarVariant(),
            duration: AppStore.getSnackbarDuration(),
            position: AppStore.getSnackbarPosition(),
            action: this.snackbarAction,
        });
    };

    snackbarAction = (key) => {
        const { classes } = this.props;
        return (
            <Fragment>
                <IconButton
                    key="close"
                    color="inherit"
                    onClick={() => {
                        this.props.closeSnackbar(key);
                    }}
                >
                    <CloseIcon className={classes.icon} />
                </IconButton>
            </Fragment>
        );
    };

    componentDidMount = () => {
        AppStore.on('openSnackbar', this.openSnackbar);
    };

    render() {
        return null;
    }
}

export default withStyles(styles)(withSnackbar(NotificationSnackbar));
