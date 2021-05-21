import React, { Fragment, PureComponent } from 'react';
import { Button, FormControl, FormControlLabel, Popover, Switch, Paper } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import AppStore from '../../stores/AppStore';
import { toggleDarkMode } from '../../actions/AppStoreActions';
import { withStyles } from '@material-ui/core/styles';
import ReactGA from 'react-ga';

const styles = {
    container: {
        padding: '0.5rem',
        minWidth: '12.25rem',
    },
    betaBadge: { transform: 'scale(1) translate(95%, -50%)' },
};

class SettingsMenu extends PureComponent {
    state = {
        anchorEl: null,
        darkMode: AppStore.getDarkMode(),
    };

    componentDidMount = () => {
        AppStore.on('darkModeToggle', () => {
            this.setState({ darkMode: AppStore.getDarkMode() });
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Button
                    onClick={(event) => {
                        this.setState({ anchorEl: event.currentTarget });
                        ReactGA.event({
                            category: 'antalmanac-rewrite',
                            action: 'Click "Settings"',
                        });
                    }}
                    color="inherit"
                    startIcon={<Settings />}
                >
                    Settings
                </Button>
                <Popover
                    open={Boolean(this.state.anchorEl)}
                    anchorEl={this.state.anchorEl}
                    onClose={() => {
                        this.setState({ anchorEl: null });
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
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={this.state.darkMode}
                                        onChange={toggleDarkMode}
                                        value="darkMode"
                                        color="primary"
                                    />
                                }
                                label={'Dark Mode'}
                            />
                        </FormControl>
                    </Paper>
                </Popover>
            </Fragment>
        );
    }
}

export default withStyles(styles)(SettingsMenu);
