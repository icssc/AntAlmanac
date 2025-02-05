import IconButton from '@material-ui/core/IconButton';
import { amber, green } from '@material-ui/core/colors';
import { Theme, withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import CloseIcon from '@material-ui/icons/Close';
import { ProviderContext, withSnackbar } from 'notistack';
import { PureComponent } from 'react';
import { useSnackbarStore } from '$stores/SnackbarStore';

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
    horizontal: 'left' | 'right';
    vertical: 'bottom' | 'top';
}

interface NotificationSnackbarProps extends ProviderContext {
    classes: ClassNameMap;
}

class NotificationSnackbar extends PureComponent<NotificationSnackbarProps> {
    state = {
        message: '',
        variant: 'info',
        duration: 3000,
    };

    unsubscribe: (() => void) | null = null;

    openSnackbar = () => {
        const state = useSnackbarStore.getState();
        
        if (state.snackbarMessage && state.snackbarMessage !== this.state.message) {
            this.setState({
                message: state.snackbarMessage,
                variant: state.snackbarVariant,
                duration: state.snackbarDuration,
            });

            this.props.enqueueSnackbar(state.snackbarMessage, {
                variant: state.snackbarVariant,
                autoHideDuration: state.snackbarDuration * 1000,
                anchorOrigin: state.snackbarPosition,
                action: this.snackbarAction,
                style: state.snackbarStyle,
            });
        }
    };
    snackbarAction = (key: string | number) => {
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

    componentDidMount() {
        this.unsubscribe = useSnackbarStore.subscribe(() => {
            this.openSnackbar();
        });
    }

    componentWillUnmount() {
        if (this.unsubscribe) {
            this.unsubscribe();
        }
    }

    render() {
        return null;
    }
}

export default withSnackbar(withStyles(styles)(NotificationSnackbar));
