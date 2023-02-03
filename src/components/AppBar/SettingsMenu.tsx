import { Button, FormControl, FormControlLabel, Paper,Popover, Radio, RadioGroup } from '@mui/material';
import { withStyles } from '@mui/styles';
import { ClassNameMap } from '@mui/styles/withStyles';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import React, { PureComponent } from 'react';

import { toggleTheme } from '../../actions/AppStoreActions';
import AppStore from '../../stores/AppStore';

const styles = {
    container: {
        padding: '0.5rem',
        minWidth: '12.25rem',
    },
    betaBadge: { transform: 'scale(1) translate(95%, -50%)' },
};

interface SettingsState {
    anchorEl?: HTMLElement;
    theme: string;
}

class SettingsMenu extends PureComponent<{ classes: ClassNameMap }, SettingsState> {
    state: SettingsState = {
        anchorEl: undefined,
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
