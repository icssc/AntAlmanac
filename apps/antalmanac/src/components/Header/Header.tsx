import { UnfoldMore } from '@mui/icons-material';
import { EventNote, Route } from '@mui/icons-material';
import {
    AppBar,
    Box,
    Button,
    ButtonGroup,
    IconButton,
    ListItemIcon,
    ListSubheader,
    MenuItem,
    MenuList,
    Popover,
    Stack,
    Typography,
} from '@mui/material';
import Link from 'next/link';
import { useEffect, useState } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';
import { Import } from '$components/Header/Import';
import { Logo } from '$components/Header/Logo';
import { Save } from '$components/Header/Save';
import AppDrawer from '$components/Header/SettingsMenu';
import { Signin } from '$components/Header/Signin';
import { Signout } from '$components/Header/Signout';
import {
    getLocalStorageDataCache,
    getLocalStorageImportedUser,
    removeLocalStorageDataCache,
    removeLocalStorageImportedUser,
} from '$lib/localStorage';
import { BLUE } from '$src/globals';
import { useIsMobile } from '$src/hooks/useIsMobile';
import { useSessionStore } from '$stores/SessionStore';

export function Header() {
    const [openSuccessfulSaved, setOpenSuccessfulSaved] = useState(false);
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const importedUser = getLocalStorageImportedUser() ?? '';
    const { session, sessionIsValid } = useSessionStore();
    const isMobile = useIsMobile();

    const platform = window.location.pathname.split('/')[1] === 'planner' ? 'Planner' : 'Scheduler';

    const clearStorage = () => {
        removeLocalStorageImportedUser();
        removeLocalStorageDataCache();
    };

    const handleCloseSuccessfulSaved = () => {
        setOpenSuccessfulSaved(false);
        clearStorage();
    };

    useEffect(() => {
        const dataCache = getLocalStorageDataCache() ?? '';

        if (importedUser !== '' && session) {
            setOpenSuccessfulSaved(true);
        } else if (dataCache !== '' && session) {
            openSnackbar('success', `Unsaved changes have been saved to your account!`);
            clearStorage();
        }
    }, [importedUser, session]);

    return (
        <AppBar
            position="static"
            color="primary"
            sx={{
                height: 52,
                padding: 1,
                boxShadow: 'none',
                backgroundColor: BLUE,
            }}
        >
            <Box
                sx={{
                    display: 'flex',
                    height: '100%',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Stack direction="row" sx={{ alignItems: 'center', gap: 2 }}>
                    {isMobile ? (
                        <>
                            <IconButton
                                onClick={(event) => setAnchorEl(event.currentTarget)}
                                sx={(theme) => ({
                                    borderRadius: theme.spacing(0.5),
                                    gap: theme.spacing(0.5),
                                    paddingX: theme.spacing(0.5),
                                    '& .MuiTouchRipple-child': {
                                        borderRadius: theme.spacing(0.5),
                                    },
                                })}
                            >
                                <Logo />
                                <UnfoldMore color="inherit" />
                            </IconButton>

                            <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={() => setAnchorEl(null)}
                                anchorOrigin={{
                                    vertical: 'bottom',
                                    horizontal: 'left',
                                }}
                                transformOrigin={{
                                    vertical: 'top',
                                    horizontal: 'left',
                                }}
                            >
                                <MenuList
                                    subheader={
                                        <ListSubheader component="div" sx={{ lineHeight: '30px' }}>
                                            Switch Apps
                                        </ListSubheader>
                                    }
                                    sx={{ width: '200px' }}
                                >
                                    <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <MenuItem
                                            selected={platform === 'Scheduler'}
                                            onClick={() => setAnchorEl(null)}
                                            sx={{ minHeight: 'fit-content' }}
                                        >
                                            <ListItemIcon>
                                                <EventNote />
                                            </ListItemIcon>
                                            <Typography variant="h6">Scheduler</Typography>
                                        </MenuItem>
                                    </Link>
                                    <Link
                                        href="https://planner-917.antalmanac.com"
                                        style={{ textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <MenuItem
                                            selected={platform === 'Planner'}
                                            onClick={() => setAnchorEl(null)}
                                            sx={{ minHeight: 'fit-content' }}
                                        >
                                            <ListItemIcon>
                                                <Route />
                                            </ListItemIcon>
                                            <Typography variant="h6">Planner</Typography>
                                        </MenuItem>
                                    </Link>
                                </MenuList>
                            </Popover>
                        </>
                    ) : (
                        <>
                            <Logo />
                            <ButtonGroup variant="outlined" color="inherit">
                                <Button color="secondary" variant="contained" sx={{ gap: 0.5 }}>
                                    <EventNote sx={{ fontSize: 16, color: BLUE }} />
                                    <Typography variant="body1" style={{ color: BLUE, fontWeight: 500 }}>
                                        Scheduler
                                    </Typography>
                                </Button>
                                <Button sx={{ gap: 0.5 }}>
                                    <Route sx={{ fontSize: 16 }} />
                                    <Typography variant="body1" style={{ color: 'white', fontWeight: 500 }}>
                                        Planner
                                    </Typography>
                                </Button>
                            </ButtonGroup>
                        </>
                    )}

                    {/* <Chip label="New!" color="primary" /> */}
                </Stack>

                <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <Import key="studylist" />
                    <Save />
                    {sessionIsValid ? <Signout /> : <Signin />}
                    <AppDrawer key="settings" />
                </Stack>

                <AlertDialog
                    open={openSuccessfulSaved}
                    title={`Schedule from "${importedUser}" has been saved to your account!`}
                    severity="success"
                    onClose={handleCloseSuccessfulSaved}
                >
                    NOTE: All changes made to your schedules will be saved to your Google account
                </AlertDialog>
            </Box>
        </AppBar>
    );
}
