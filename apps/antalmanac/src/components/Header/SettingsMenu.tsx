import { Button, FormControl, FormControlLabel, Paper, Popover, Radio, RadioGroup } from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import { useEffect, useState } from 'react';

import { toggleTheme } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

function SettingsMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();
    const [theme, setTheme] = useState(AppStore.getTheme());

    const handleThemeChange = () => {
        setTheme(AppStore.getTheme());
    };

    useEffect(() => {
        AppStore.on('themeToggle', handleThemeChange);

        return () => {
            AppStore.off('themeToggle', handleThemeChange);
        };
    }, []);

    return (
        <>
            <Button
                onClick={(event) => {
                    setAnchorEl(event.currentTarget);
                }}
                color="inherit"
                startIcon={<Settings />}
            >
                Settings
            </Button>
            <Popover
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => {
                    setAnchorEl(undefined);
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
                <Paper style={{ padding: '0.5rem', minWidth: '12.25rem' }}>
                    <FormControl>
                        <RadioGroup aria-label="theme" name="theme" value={theme} onChange={toggleTheme}>
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

export default SettingsMenu;
