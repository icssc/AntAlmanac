import React, { PureComponent } from 'react';
import CloseIcon from '@material-ui/icons/Close';
import { amber, green } from '@material-ui/core/colors';
import IconButton from '@material-ui/core/IconButton';
import AppStore from '../../stores/AppStore';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { withSnackbar } from 'notistack';

const styles: Styles<Theme, object> = (theme) => ({
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
    },
    iconVariant: {},
    message: {
        display: 'flex',
        alignItems: 'center',
    },
});

export interface SnackbarPosition {
    horizontal: 'left'|'right'
    vertical: 'bottom'|'top'
}

interface NotificationSnackbarProps {
    classes: ClassNameMap,
    enqueueSnackbar: any, // these come from AppStoreActions. leaving untyped because we're hopefully gonna refactor. see #401
    closeSnackbar: any
}

class NotificationSnackbar extends PureComponent<NotificationSnackbarProps> {
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
            style: AppStore.getSnackbarStyle(),
        });
    };

    snackbarAction = (key: string|number) => {
        const { classes } = this.props;
        return (
            <IconButton
                key="close"
                color="inherit"
                onClick={() => {
                    this.props.closeSnackbar(key);
                }}
            >
                <CloseIcon className={classes.icon} />
            </IconButton>
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
