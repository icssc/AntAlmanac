import { Button, Paper, Popover, Theme } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { IosShare } from '@mui/icons-material';
import { PureComponent } from 'react';

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
};

interface ExportsState {
    anchorEl?: HTMLElement;
}

class ExportsMenu extends PureComponent<{ classes: ClassNameMap }, ExportsState> {
    state: ExportsState = {
        anchorEl: undefined,
    };

    render() {
        const { classes } = this.props;

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
                        <ExportCalendar />
                        <ScreenshotButton />
                    </Paper>
                </Popover>
            </>
        );
    }
}

export default withStyles(styles)(ExportsMenu);
