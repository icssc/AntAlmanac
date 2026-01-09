import { LightMode, Close, SettingsBrightness, DarkMode, Help, MenuRounded } from '@mui/icons-material';
import {
    Box,
    Button,
    ButtonGroup,
    Divider,
    Drawer,
    Stack,
    Switch,
    Tooltip,
    Typography,
    useMediaQuery,
} from '@mui/material';
import IconButton from '@mui/material/IconButton';
import { CSSProperties } from '@mui/material/styles/createTypography';
import { usePostHog } from 'posthog-js/react';
import { useCallback, useState } from 'react';

import { About } from './About';

import actionTypesStore from '$actions/ActionTypesStore';
import { autoSaveSchedule } from '$actions/AppStoreActions';
import { PlannerButton } from '$components/buttons/Planner';
import { useIsMobile } from '$hooks/useIsMobile';
import { getLocalStorageUserId } from '$lib/localStorage';
import appStore from '$stores/AppStore';
import { useCoursePaneStore } from '$stores/CoursePaneStore';
import { scheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useSessionStore } from '$stores/SessionStore';
import { usePreviewStore, useThemeStore, useTimeFormatStore, useAutoSaveStore } from '$stores/SettingsStore';

const lightSelectedStyle: CSSProperties = {
    backgroundColor: '#F0F7FF',
    borderColor: '#007FFF',
    color: '#007FFF',
};

const darkSelectedStyle: CSSProperties = {
    backgroundColor: '#003A7570',
    borderColor: '#0059B2',
    color: '#99CCF3',
};

function getSelectedStyle(buttonValue: string, themeSetting: string, isDark: boolean) {
    return themeSetting === buttonValue ? (isDark ? darkSelectedStyle : lightSelectedStyle) : {};
}

function ThemeMenu() {
    const [themeSetting, isDark, setTheme] = useThemeStore((store) => [
        store.themeSetting,
        store.isDark,
        store.setAppTheme,
    ]);
    const { forceUpdate } = useCoursePaneStore();
    const postHog = usePostHog();

    const handleThemeChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        forceUpdate();
        setTheme(event.currentTarget.value as 'light' | 'dark' | 'system', postHog);
    };

    return (
        <Box sx={{ padding: '0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginBottom: '1rem' }}>
                Theme
            </Typography>

            <ButtonGroup style={{ display: 'flex', placeContent: 'center', width: '100%', borderColor: 'unset' }}>
                <Button
                    startIcon={<LightMode fontSize="small" />}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px 0px 0px 12px',
                        width: '100%',
                        ...getSelectedStyle('light', themeSetting, isDark),
                    }}
                    value="light"
                    onClick={handleThemeChange}
                >
                    Light
                </Button>
                <Button
                    startIcon={<SettingsBrightness fontSize="small" />}
                    style={{
                        padding: '1rem 2rem',
                        width: '100%',
                        ...getSelectedStyle('system', themeSetting, isDark),
                    }}
                    value="system"
                    onClick={handleThemeChange}
                >
                    System
                </Button>
                <Button
                    startIcon={<DarkMode fontSize="small" />}
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '0px 12px 12px 0px',
                        width: '100%',
                        ...getSelectedStyle('dark', themeSetting, isDark),
                    }}
                    value="dark"
                    onClick={handleThemeChange}
                >
                    Dark
                </Button>
            </ButtonGroup>
        </Box>
    );
}

function TimeMenu() {
    const [isMilitaryTime, setTimeFormat] = useTimeFormatStore((store) => [store.isMilitaryTime, store.setTimeFormat]);
    const isDark = useThemeStore((store) => store.isDark);

    const handleTimeFormatChange = (event: React.MouseEvent<HTMLButtonElement>) => {
        setTimeFormat(event.currentTarget.value == 'true');
    };

    return (
        <Box sx={{ padding: '0 1rem', width: '100%' }}>
            <Typography variant="h6" style={{ marginBottom: '1rem' }}>
                Time
            </Typography>

            <ButtonGroup
                style={{
                    display: 'flex',
                    placeContent: 'center',
                    width: '100%',
                }}
            >
                <Button
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '12px 0px 0px 12px',
                        width: '100%',
                        fontSize: '12px',
                        ...getSelectedStyle('false', isMilitaryTime.toString(), isDark),
                    }}
                    value="false"
                    onClick={handleTimeFormatChange}
                    fullWidth={true}
                >
                    12 Hour
                </Button>
                <Button
                    style={{
                        padding: '1rem 2rem',
                        borderRadius: '0px 12px 12px 0px',
                        width: '100%',
                        fontSize: '12px',
                        ...getSelectedStyle('true', isMilitaryTime.toString(), isDark),
                    }}
                    value="true"
                    onClick={handleTimeFormatChange}
                >
                    24 Hour
                </Button>
            </ButtonGroup>
        </Box>
    );
}

function PlannerMenu() {
    return (
        <Box sx={{ padding: '0 1rem', width: '100%', display: 'flex', justifyContent: 'center' }}>
            <PlannerButton
                buttonSx={{
                    width: '100%',
                }}
            />
        </Box>
    );
}

function ExperimentalMenu() {
    const [previewMode, setPreviewMode] = usePreviewStore((store) => [store.previewMode, store.setPreviewMode]);
    const [autoSave, setAutoSave] = useAutoSaveStore((store) => [store.autoSave, store.setAutoSave]);
    const { sessionIsValid, session } = useSessionStore();
    const { setOpenAutoSaveWarning } = scheduleComponentsToggleStore();

    const postHog = usePostHog();

    const handlePreviewChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setPreviewMode(event.target.checked);
    };

    const handleAutoSaveChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        setAutoSave(event.target.checked);

        if (!event.target.checked) return;

        if (!sessionIsValid || !session) {
            setOpenAutoSaveWarning(true);
            return;
        }

        const savedUserID = getLocalStorageUserId();

        if (!savedUserID) return;
        actionTypesStore.emit('autoSaveStart');
        await autoSaveSchedule(savedUserID, undefined, postHog);
        appStore.unsavedChanges = false;
        actionTypesStore.emit('autoSaveEnd');
    };

    return (
        <Stack sx={{ padding: '0 1rem', width: '100%', display: 'flex', alignItems: 'middle' }}>
            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        Hover to Preview
                    </Typography>
                    <Tooltip title={<Typography>Hover over courses to preview them in your calendar!</Typography>}>
                        <Help />
                    </Tooltip>
                </Box>
                <Switch color={'primary'} value={previewMode} checked={previewMode} onChange={handlePreviewChange} />
            </Box>

            <Box style={{ display: 'flex', justifyContent: 'space-between', width: '1' }}>
                <Box style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Typography variant="h6" style={{ display: 'flex', alignItems: 'center', alignContent: 'center' }}>
                        Auto Save
                    </Typography>
                    <Tooltip title={<Typography>Auto Save your schedule!</Typography>}>
                        <Help />
                    </Tooltip>
                </Box>
                <Switch color={'primary'} value={autoSave} checked={autoSave} onChange={handleAutoSaveChange} />
            </Box>
        </Stack>
    );
}

function SettingsMenu() {
    const isMobile = useIsMobile();

    return (
        <Stack gap={2}>
            <ThemeMenu />
            <TimeMenu />

            {isMobile && (
                <Stack gap={2}>
                    <Divider>
                        <Typography variant="subtitle2">Want a 4-year plan?</Typography>
                    </Divider>

                    <PlannerMenu />
                </Stack>
            )}

            <Stack gap={2}>
                <Divider>
                    <Typography variant="subtitle2">Experimental Features</Typography>
                </Divider>

                <ExperimentalMenu />
            </Stack>
        </Stack>
    );
}

function AppDrawer() {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const isMobileScreen = useMediaQuery('(max-width:750px)');

    const handleDrawerOpen = useCallback(() => {
        setDrawerOpen(true);
    }, []);

    const handleDrawerClose = useCallback(() => {
        setDrawerOpen(false);
    }, []);

    return (
        <>
            <IconButton onClick={handleDrawerOpen} color="inherit" size="large" style={{ padding: '4px' }}>
                <MenuRounded />
            </IconButton> {/*
            <Drawer
                anchor="right"
                open={drawerOpen}
                onClose={handleDrawerClose}
                PaperProps={{ style: { borderRadius: '10px 0 0 10px' } }}
                variant="temporary"
            >
                <Box style={{ width: isMobileScreen ? '300px' : '360px', height: '100%' }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexDirection: 'row',
                            alignItems: 'end',
                            paddingTop: '8px',
                            paddingRight: '12px',
                        }}
                    >
                        <IconButton size="large" onClick={handleDrawerClose} style={{ marginLeft: 'auto' }}>
                            <Close />
                        </IconButton>
                    </Box>

                    <SettingsMenu />

                    <Box sx={{ padding: '1.5rem', width: '100%', bottom: 0, position: 'absolute' }}>
                        <About />
                    </Box>
                </Box>
            </Drawer>*/}
        </>
    );
}
/*
import { useContext } from 'react';

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover } from '@mui/material';
import './Profile.module.css';

import Link from 'next/link';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import GradingIcon from '@mui/icons-material/Grading';
import FlagIcon from '@mui/icons-material/Flag';
import { usePathname } from 'next/navigation';
//import { useAppSelector } from '../../store/hooks';
import Image from 'next/image';
//import TabSelector, { TabOption } from '../../app/roadmap/sidebar/TabSelector';
//import { Theme } from '@peterportal/types';
import React from 'react';
import trpc from '$lib/api/trpc';
import { User } from '@packages/antalmanac-types';



interface AdminProfileLinksProps {
  pathname: string | null;
  onClose: () => void;
}

const ThemeContext = React.createContext<{
  darkMode: boolean;
  usingSystemTheme: boolean;
  setTheme: (theme: Theme) => void;
}>({
  darkMode: false,
  usingSystemTheme: false,
  setTheme: () => {},
});

const AdminProfileLinks = ({ pathname, onClose }: AdminProfileLinksProps) => {
  return (
    <>
      <ListItem>
        <ListItemButton
          className={'profile-popover__link' + (pathname === '/admin/verify' ? ' active' : '')}
          href="/admin/verify"
          onClick={onClose}
          component={Link}
        >
          <ListItemIcon>
            <GradingIcon />
          </ListItemIcon>
          <ListItemText primary="Verify Reviews" />
        </ListItemButton>
      </ListItem>
      <ListItem>
        <ListItemButton
          className={'profile-popover__link' + (pathname === '/admin/reports' ? ' active' : '')}
          href="/admin/reports"
          onClick={onClose}
          component={Link}
        >
          <ListItemIcon>
            <FlagIcon />
          </ListItemIcon>
          <ListItemText primary="View Reports" />
        </ListItemButton>
      </ListItem>
    </>
  );
};

export const Profile = () => {
  const { darkMode, setTheme, usingSystemTheme } = useContext(ThemeContext);
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (open) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };

    const [user, setUser] = useState<null | User>(null);
    const { session, sessionIsValid, clearSession } = useSessionStore();

    const handleAuthChange = useCallback(async () => {
        if (sessionIsValid) {
            const userData = await trpc.userData.getUserAndAccountBySessionToken
                .query({ token: session ?? '' })
                .then((res) => res.users);
            setUser(userData);
        }
    }, [session, sessionIsValid, setUser]);

  if (!user) {
    return (
      <a href={`/api/users/auth/google`} className="login-button">
        <Button startIcon={<ExitToAppIcon />} color="inherit">
          Log In
        </Button>
      </a>
    );
  }

  const { name, email, avatar } = user;

  const themeTabs: TabOption[] = [
    { value: 'light', label: 'Light', icon: <LightModeIcon /> },
    { value: 'system', label: 'System', icon: <SettingsBrightnessIcon /> },
    { value: 'dark', label: 'Dark', icon: <DarkModeIcon /> },
  ];

  const getCurrentTheme = (): Theme => {
    if (usingSystemTheme) return 'system';
    return darkMode ? 'dark' : 'light';
  };

  const handleThemeChange = (tab: string) => {
    setTheme(tab as Theme);
  };

  const profilePopoverContent = (
    <div>
      <div className="profile-popover-header">
        <Image   src={avatar ?? "/default-avatar.png"} alt={name ?? "/default-avatar.png"} width="50" height="50" />
        <div>
          <h1 title={name}>{name}</h1>
          <h2 title={email}>{email}</h2>
        </div>
      </div>
      <div className="profile-popover-theme-selector">
        <h4>Theme</h4>
        <TabSelector tabs={themeTabs} selectedTab={getCurrentTheme()} onTabChange={handleThemeChange} />
        <Divider />
      </div>
      <List className="profile-popover-links">
        <ListItem>
          <ListItemButton
            className={'profile-popover-link' + (pathname === '/reviews' ? ' active' : '')}
            href="/reviews"
            onClick={() => setAnchorEl(null)}
            component={Link}
          >
            <ListItemIcon>
              <StickyNote2OutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Your Reviews" />
          </ListItemButton>
        </ListItem>
        {isAdmin && <AdminProfileLinks pathname={pathname} onClose={() => setAnchorEl(null)} />}
        <ListItem>
          <ListItemButton href={'/api/users/auth/logout'} className="profile-popover-link" component="a">
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Log Out" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className="navbar-profile">
      <button className="profile-button" onClick={handleClick}>
        <Image src={avatar ?? "/default-avatar.png" } alt={name ?? "/default-avatar.png" } className="navbar-profile-pic" width={36} height={36} />
      </button>
      <Popover
        className="profile-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {profilePopoverContent}
      </Popover>
    </div>
  );
};



/*
import { useContext } from 'react';

import { List, ListItem, ListItemButton, ListItemIcon, ListItemText, Popover } from '@mui/material';

import Link from 'next/link';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsBrightnessIcon from '@mui/icons-material/SettingsBrightness';
import LightModeIcon from '@mui/icons-material/LightMode';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import StickyNote2OutlinedIcon from '@mui/icons-material/StickyNote2Outlined';
import GradingIcon from '@mui/icons-material/Grading';
import FlagIcon from '@mui/icons-material/Flag';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import trpc from '$lib/api/trpc';
import { User } from '@packages/antalmanac-types';



export const Profile = () => {
  const pathname = usePathname();
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    if (open) {
      setAnchorEl(null);
    } else {
      setAnchorEl(event.currentTarget);
    }
  };
    const [userperson, setUser] = useState<null | User>(null);
    const { sessionIsValid, session } = useSessionStore();

  //This is probably really bad
    const handleAuthChange = useCallback(async () => {
        if (sessionIsValid) {
            const userData = await trpc.userData.getUserAndAccountBySessionToken
                .query({ token: session ?? '' })
                .then((res) => res.users);
            setUser(userData);
        }
    }, [setUser]);  


  const profilePopoverContent = (
    <div>
      <div className="profile-popover-header">
        <Image src={userperson?.avatar} alt={userperson?.name}  width="50" height="50" />
        <div>
          <h1 title={userperson?.name}>{userperson?.name}</h1>
          <h2 title={userperson?.email}>{userperson?.email}</h2>
        </div>
      </div>
      <div className="profile-popover-theme-selector">
        <h4>Theme</h4>
        <ThemeMenu />
        <Divider />
      </div>
      <List className="profile-popover-links">
        <ListItem>
          <ListItemButton
            className={'profile-popover-link' + (pathname === '/reviews' ? ' active' : '')}
            href="/reviews"
            onClick={() => setAnchorEl(null)}
            component={Link}
          >
            <ListItemIcon>
              <StickyNote2OutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Your Reviews" />
          </ListItemButton>
        </ListItem>
      </List>
    </div>
  );

  return (
    <div className="navbar-profile">
      <button className="profile-button" onClick={handleClick}>
        <Image src={userperson?.avatar} alt={userperson?.name} className="navbar-profile-pic" width={36} height={36} />
      </button>
      <Popover
        className="profile-popover"
        open={open}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {profilePopoverContent}
      </Popover>
    </div>
  );
};*/



export default AppDrawer;
