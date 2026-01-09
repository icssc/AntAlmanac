import { CalendarMonth, Map, UnfoldMore } from '@mui/icons-material';
import {
    AppBar,
    Box,
    Divider,
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
    removeLocalStorageImportedUser,
    removeLocalStorageDataCache,
    getLocalStorageImportedUser,
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
                <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0, sm: 1 } }}>
                    {!isMobile && (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Logo />
                            <Divider
                                orientation="vertical"
                                flexItem
                                sx={(theme) => ({ borderColor: theme.palette.secondary.main })}
                            />
                        </Box>
                    )}

                    <Stack sx={{ flexDirection: 'row', alignItems: 'center' }}>
                        {isMobile ? (
                            <Logo />
                        ) : (
                            <Typography variant={'h5'} sx={{ minWidth: 'auto' }}>
                                Scheduler
                            </Typography>
                        )}

                        <IconButton
                            onClick={(event) => setAnchorEl(event.currentTarget)}
                            sx={(theme) => ({
                                borderRadius: theme.spacing(0.5),
                                paddingX: theme.spacing(0.5),
                                '& .MuiTouchRipple-child': {
                                    borderRadius: theme.spacing(0.5),
                                },
                            })}
                        >
                            <UnfoldMore color="secondary" />
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
                                    <MenuItem selected={true} onClick={() => setAnchorEl(null)}>
                                        <ListItemIcon>
                                            <CalendarMonth />
                                        </ListItemIcon>
                                        <Typography variant="h6">Scheduler</Typography>
                                    </MenuItem>
                                </Link>
                                <Link
                                    href="https://planner-926.antalmanac.com"
                                    style={{ textDecoration: 'none', color: 'inherit' }}
                                >
                                    <MenuItem selected={false} onClick={() => setAnchorEl(null)}>
                                        <ListItemIcon>
                                            <Map />
                                        </ListItemIcon>
                                        <Typography variant="h6">Planner</Typography>
                                    </MenuItem>
                                </Link>
                            </MenuList>
                        </Popover>
                    </Stack>
                </Box>

                <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <Save />
                    <Import key="studylist" />
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
