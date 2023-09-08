import { Button, Paper, Popover, Theme } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { IosShare } from '@mui/icons-material';
import { PureComponent } from 'react';

import AppStore from '$stores/AppStore';
import ExportCalendar from '$components/AppBar/Exports/ExportCalendar';
import ScreenshotButton from '$components/AppBar/Exports/ScreenshotButton';

const styles: Styles<Theme, object> = {
    container: {
        padding: '0.75rem',
        minWidth: '12.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    betaBadge: { transform: 'scale(1) translate(95%, -50%)' },
};

interface SettingsState {
    anchorEl?: HTMLElement;
    theme: string;
    screenshotting: boolean;
}

class SettingsMenu extends PureComponent<{ classes: ClassNameMap }, SettingsState> {
    state: SettingsState = {
        anchorEl: undefined,
        theme: AppStore.getTheme(),
        screenshotting: false,
    };

    componentDidMount = () => {
        AppStore.on('themeToggle', () => {
            this.setState({ theme: AppStore.getTheme() });
        });
    };

    render() {
        const { classes } = this.props;

        const onTakeScreenshot = (html2CanvasScreenshot: () => void) => {
            // This function takes a screenshot of the user's schedule

            this.setState({ screenshotting: true }, () => {
                // Take the picture
                html2CanvasScreenshot();

                this.setState({ screenshotting: false });
            });
        };

        return (
            <>
                <Button
                    onClick={(event) => {
                        this.setState({ anchorEl: event.currentTarget });
                    }}
                    color="inherit"
                    startIcon={<IosShare />}
                >
                    Export
                </Button>
                <Popover
                    open={Boolean(this.state.anchorEl)}
                    anchorEl={this.state.anchorEl}
                    onClose={() => {
                        this.setState({ anchorEl: undefined });
                    }}
                    anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                    }}
                    transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                    }}
                >
                    <Paper className={classes.container}>
                        <ExportCalendar key="export" />
                        <ScreenshotButton onTakeScreenshot={onTakeScreenshot} key="screenshot" />
                    </Paper>
                </Popover>
            </>
        );
    }
}

export default withStyles(styles)(SettingsMenu);
