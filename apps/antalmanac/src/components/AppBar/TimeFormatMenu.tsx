import { Button, FormControl, FormControlLabel, Paper, Popover, Radio, RadioGroup } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import { ClassNameMap } from '@material-ui/core/styles/withStyles';
import AccessTimeIcon from '@material-ui/icons/AccessTime';
import { PureComponent } from 'react';

import { toggleShow24HourTime } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

const styles = {
    container: {
        padding: '0.5rem',
        minWidth: '12.25rem',
    },
    betaBadge: { transform: 'scale(1) translate(95%, -50%)' },
};

interface TimeFormatSettingsState {
    anchorEl?: HTMLElement;
    show24HourTime: boolean;
}

class TimeFormatMenu extends PureComponent<{ classes: ClassNameMap }, TimeFormatSettingsState> {
    state: TimeFormatSettingsState = {
        anchorEl: undefined,
        show24HourTime: AppStore.getShow24HourTime(),
    };

    componentDidMount = () => {
        AppStore.on('show24HourToggle', () => {
            this.setState({ show24HourTime: AppStore.getShow24HourTime() });
        });
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
                    startIcon={<AccessTimeIcon />}
                >
                    Time Format
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
                        <FormControl>
                            <RadioGroup
                                aria-label="show24HourTime"
                                name="show24HourTime"
                                value={this.state.show24HourTime.toString()}
                                onChange={toggleShow24HourTime}
                            >
                                <FormControlLabel value="false" control={<Radio color="primary" />} label="12-hour" />
                                <FormControlLabel value="true" control={<Radio color="primary" />} label="24-hour" />
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                </Popover>
            </>
        );
    }
}

export default withStyles(styles)(TimeFormatMenu);
