import React, { PureComponent } from 'react';
import { Button, FormControl, FormControlLabel, Popover, RadioGroup, Radio, Paper } from '@material-ui/core';
import Brightness4Icon from '@material-ui/icons/Brightness4';
import AppStore from '../../stores/AppStore';
import { toggleTheme } from '../../actions/AppStoreActions';
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
        theme: AppStore.getTheme(),
    };

    componentDidMount = () => {
        AppStore.on('themeToggle', () => {
            this.setState({ theme: AppStore.getTheme() });
        });
    };

    render() {
        const { classes } = this.props;

        return (
            <>
                <Button
                    onClick={(event) => {
                        this.setState({ anchorEl: event.currentTarget });
                        ReactGA.event({
                            category: 'antalmanac-rewrite',
                            action: 'Click "Settings"',
                        });
                    }}
                    color="inherit"
                    startIcon={<Brightness4Icon />}
                >
                    Theme
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
                            <RadioGroup aria-label="theme" name="theme" value={this.state.theme} onChange={toggleTheme}>
                                <FormControlLabel value="light" control={<Radio color="primary" />} label="Light" />
                                <FormControlLabel value="dark" control={<Radio color="primary" />} label="Dark" />
                                <FormControlLabel value="auto" control={<Radio color="primary" />} label="Automatic" />
                            </RadioGroup>
                        </FormControl>
                    </Paper>
                </Popover>
            </>
        );
    }
}

export default withStyles(styles)(SettingsMenu);
