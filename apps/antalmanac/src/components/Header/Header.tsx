import { EventNote, Route, UnfoldMore } from '@mui/icons-material';
import {
    AppBar,
    Box,
    Button,
    ButtonGroup,
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
    const [openSignoutDialog, setOpenSignoutDialog] = useState(false);
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

    const handleLogoutComplete = () => {
        setOpenSignoutDialog(true);
    };

    const handleCloseSignoutDialog = () => {
        setOpenSignoutDialog(false);
        window.location.reload();
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
                <Stack direction="row" alignItems="center" gap={1}>
                    {isMobile ? (
                        <>
                            <Button
                                onClick={(event) => setAnchorEl(event.currentTarget)}
                                endIcon={<UnfoldMore />}
                                sx={{
                                    minWidth: 'auto',
                                    p: 0.5,
                                    color: 'white',
                                    '& .MuiTouchRipple-child': {
                                        borderRadius: 0.5,
                                        bgcolor: 'white',
                                    },
                                }}
                            >
                                <Logo />
                            </Button>

                            <Popover
                                open={Boolean(anchorEl)}
                                anchorEl={anchorEl}
                                onClose={() => setAnchorEl(null)}
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                                transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                            >
                                <MenuList
                                    subheader={
                                        <ListSubheader component="div" sx={{ lineHeight: '30px' }}>
                                            Switch Apps
                                        </ListSubheader>
                                    }
                                    sx={{ width: 200 }}
                                >
                                    <MenuItem
                                        component={Link}
                                        href="/"
                                        selected={platform === 'Scheduler'}
                                        onClick={() => setAnchorEl(null)}
                                        sx={{ minHeight: 'fit-content', textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <ListItemIcon>
                                            <EventNote />
                                        </ListItemIcon>
                                        <Typography variant="h6">Scheduler</Typography>
                                    </MenuItem>
                                    <MenuItem
                                        component={Link}
                                        href="https://planner-917.antalmanac.com"
                                        selected={platform === 'Planner'}
                                        onClick={() => setAnchorEl(null)}
                                        sx={{ minHeight: 'fit-content', textDecoration: 'none', color: 'inherit' }}
                                    >
                                        <ListItemIcon>
                                            <Route />
                                        </ListItemIcon>
                                        <Typography variant="h6">Planner</Typography>
                                    </MenuItem>
                                </MenuList>
                            </Popover>
                        </>
                    ) : (
                        <>
                            <Logo />
                            <ButtonGroup variant="outlined" color="inherit">
                                <Button
                                    variant="contained"
                                    startIcon={<EventNote />}
                                    sx={{
                                        boxShadow: 'none',
                                        bgcolor: 'white',
                                        color: BLUE,
                                        fontWeight: 500,
                                        fontSize: 14,
                                        '&:hover': { bgcolor: 'grey.100' },
                                    }}
                                >
                                    Scheduler
                                </Button>
                                <Button
                                    startIcon={<Route />}
                                    sx={{ boxShadow: 'none', color: 'white', fontWeight: 500, fontSize: 14 }}
                                >
                                    Planner
                                </Button>
                            </ButtonGroup>
                        </>
                    )}
                </Stack>

                <Stack direction="row" alignItems="center">
                    <Import key="studylist" />
                    <Save />
                    {sessionIsValid ? <Signout onLogoutComplete={handleLogoutComplete} /> : <Signin />}
                </Stack>

                <AlertDialog
                    open={openSuccessfulSaved}
                    title={`Schedule from "${importedUser}" has been saved to your account!`}
                    severity="success"
                    onClose={handleCloseSuccessfulSaved}
                >
                    NOTE: All changes made to your schedules will be saved to your Google account
                </AlertDialog>
                <AlertDialog
                    open={openSignoutDialog}
                    title="Signed out successfully"
                    severity="info"
                    onClose={handleCloseSignoutDialog}
                >
                    You have successfully signed out. Close to continue browsing AntAlmanac.
                </AlertDialog>
            </Box>
        </AppBar>
    );
}
