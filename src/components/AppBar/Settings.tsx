import { useEffect, useState } from 'react';
import { Brightness4 as Brightness4Icon } from '@mui/icons-material';
import { Button, FormControl, FormControlLabel, Paper, Popover, Radio, RadioGroup } from '@mui/material';
import { toggleTheme } from '$lib/AppStoreActions';
import AppStore from '$lib/AppStore';

export default function SettingsMenu() {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const [theme, setTheme] = useState(AppStore.getTheme());

  function handleClick(e: React.MouseEvent<HTMLButtonElement, MouseEvent>) {
    setAnchorEl(e.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  useEffect(() => {
    AppStore.on('themeToggle', () => {
      setTheme(AppStore.getTheme());
    });
  }, []);
  return (
    <>
      <Button onClick={handleClick} color="inherit" startIcon={<Brightness4Icon />}>
        Theme
      </Button>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
      >
        <Paper sx={{ padding: '0.5rem', minWidth: '12.5rem' }}>
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
