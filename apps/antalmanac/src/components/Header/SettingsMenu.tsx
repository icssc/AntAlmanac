import {
    Box,
    Button,
    FormControl,
    FormControlLabel,
    Paper,
    Popover,
    Radio,
    RadioGroup,
    Typography,
} from '@material-ui/core';
import { Settings } from '@material-ui/icons';
import { ChangeEvent, useEffect, useState } from 'react';

import { toggleTheme } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';
import { useTimeFormatStore } from '$stores/TimeStore';

function SettingsMenu() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();
    const [theme, setTheme] = useState(AppStore.getTheme());

    const { isMilitaryTime } = useTimeFormatStore();

    const handleThemeChange = () => {
        setTheme(AppStore.getTheme());
    };

    const handleTimeChange = (event: ChangeEvent<HTMLInputElement>) => {
        useTimeFormatStore.getState().setTimeFormat(event.target.value == 'true');
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
                <Paper style={{ padding: '1rem', display: 'flex', gap: 10 }}>
                    <Box>
                        <Typography variant="h6">Theme</Typography>
                        <FormControl>
                            <RadioGroup aria-label="theme" name="theme" value={theme} onChange={toggleTheme}>
                                <FormControlLabel value="light" control={<Radio color="primary" />} label="Light" />
                                <FormControlLabel value="dark" control={<Radio color="primary" />} label="Dark" />
                                <FormControlLabel value="auto" control={<Radio color="primary" />} label="Automatic" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                    <Box>
                        <Typography variant="h6">Time Format</Typography>
                        <FormControl>
                            <RadioGroup
                                aria-label="theme"
                                name="theme"
                                value={isMilitaryTime}
                                onChange={handleTimeChange}
                            >
                                <FormControlLabel value={false} control={<Radio color="primary" />} label="12 Hour" />
                                <FormControlLabel value={true} control={<Radio color="primary" />} label="24 Hour" />
                            </RadioGroup>
                        </FormControl>
                    </Box>
                </Paper>
            </Popover>
        </>
    );
}

export default SettingsMenu;
