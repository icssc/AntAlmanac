import React, { PureComponent } from 'react';
import CheckCircleIcon from '@material-ui/icons/CheckCircle';
import ErrorIcon from '@material-ui/icons/Error';
import InfoIcon from '@material-ui/icons/Info';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import Snackbar from '@material-ui/core/Snackbar';
import SnackbarContent from '@material-ui/core/SnackbarContent';
import WarningIcon from '@material-ui/icons/Warning';
import AppStore from '../../stores/AppStore';
import { withStyles } from '@material-ui/core/styles';

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
        open: false,
        message: '',
        variant: 'info',
    };

    openSnackbar = () => {
        this.setState({
            open: true,
            message: AppStore.getSnackbarMessage(),
            variant: AppStore.getSnackbarVariant(),
        });
    };

    closeSnackbar = () => {
        this.setState({ open: false });
    };

    componentDidMount() {
        AppStore.on('openSnackbar', this.openSnackbar);
    }

    handleClose = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }

        this.closeSnackbar();
    };

    render() {
        const { classes } = this.props;
        const Icon = variantIcon[this.state.variant];

        return (
            <Snackbar
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                open={this.state.open}
                autoHideDuration={4000}
                onClose={this.handleClose}
            >
                <SnackbarContent
                    className={classes[this.state.variant]}
                    message={
                        <span className={classes.message}>
                            <Icon className={classes.icon} />
                            {this.state.message}
                        </span>
                    }
                    action={[
                        <IconButton
                            key="close"
                            color="inherit"
                            onClick={this.closeSnackbar}
                        >
                            <CloseIcon className={classes.icon} />
                        </IconButton>,
                    ]}
                />
            </Snackbar>
        );
    }
}

export default withStyles(styles)(NotificationSnackbar);
