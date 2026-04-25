import { loadSchedule } from '$actions/AppStoreActions';
import SignInButton from '$components/buttons/SignInButton';
import { getSettingsPopoverPaperSx } from '$components/Header/headerStyles';
import { ProfileMenuButtons } from '$components/Header/ProfileMenuButtons';
import { SettingsMenu } from '$components/Header/Settings/SettingsMenu';
import SignInAlertDialog from '$components/SignInAlertDialog';
import trpc from '$lib/api/trpc';
import { getLocalStorageUserId } from '$lib/localStorage';
import { useScheduleComponentsToggleStore } from '$stores/ScheduleComponentsToggleStore';
import { useThemeStore } from '$stores/SettingsStore';
import { AccountCircle, ExpandMore } from '@mui/icons-material';
import {
    Alert,
    AlertTitle,
    Box,
    Button,
    Collapse,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    Divider,
    ListItemIcon,
    ListItemText,
    MenuItem,
    Popover,
    Stack,
    TextField,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

export const Signin = () => {
    const isDark = useThemeStore((store) => store.isDark);

    const { openLoadingSchedule, setOpenLoadingSchedule } = useScheduleComponentsToggleStore(
        useShallow((state) => ({
            openLoadingSchedule: state.openLoadingSchedule,
            setOpenLoadingSchedule: state.setOpenLoadingSchedule,
        }))
    );

    const [settingsAnchorEl, setSettingsAnchorEl] = useState<null | HTMLElement>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [userID, setUserID] = useState('');
    const [rememberMe] = useState(true);
    const [showLegacyLogin, setShowLegacyLogin] = useState(false);
    const [openAlert, setOpenalert] = useState(false);

    const handleOpen = useCallback(() => {
        setIsOpen(true);
        setSettingsAnchorEl(null);
        if (typeof Storage !== 'undefined') {
            const savedUserID = getLocalStorageUserId();
            if (savedUserID !== null) {
                setUserID(savedUserID);
            }
        }
    }, []);

    const handleSettingsOpen = (event: React.MouseEvent<HTMLElement>) => {
        setSettingsAnchorEl(event.currentTarget);
    };

    const validateImportedUser = useCallback(async (userID: string) => {
        try {
            const res = await trpc.userData.getGuestAccountAndUserByName
                .query({ name: userID })
                .then((res) => res.users);
            if (res.imported) {
                setOpenalert(true);
            }
            return res;
        } catch (error) {
            console.error('Error validating imported user:', error);
            return false;
        }
    }, []);

    const loadScheduleAndSetLoading = useCallback(
        async (userID: string, rememberMe: boolean) => {
            setOpenLoadingSchedule(true);
            await loadSchedule(userID, rememberMe, 'GUEST');
            await validateImportedUser(userID);
            setOpenLoadingSchedule(false);
        },
        [setOpenLoadingSchedule, validateImportedUser]
    );

    const enterEvent = useCallback(
        (event: KeyboardEvent) => {
            if (!showLegacyLogin) return;

            const charCode = event.which ? event.which : event.keyCode;

            if (charCode === 13 || charCode === 10) {
                event.preventDefault();
                setIsOpen(false);
                document.removeEventListener('keydown', enterEvent, false);
                void loadScheduleAndSetLoading(userID, rememberMe);
                setUserID('');
                return false;
            }
        },
        [showLegacyLogin, loadScheduleAndSetLoading, userID, rememberMe]
    );

    const handleClose = useCallback(
        (wasCancelled: boolean) => {
            if (wasCancelled) {
                setIsOpen(false);
                document.removeEventListener('keydown', enterEvent, false);
                setUserID('');
            } else {
                setIsOpen(false);
                document.removeEventListener('keydown', enterEvent, false);
                void loadScheduleAndSetLoading(userID, rememberMe);
                setUserID('');
            }
        },
        [loadScheduleAndSetLoading, userID, rememberMe, enterEvent]
    );

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', enterEvent, false);
        } else {
            document.removeEventListener('keydown', enterEvent, false);
        }

        return () => {
            document.removeEventListener('keydown', enterEvent, false);
        };
    }, [isOpen, enterEvent]);

    return (
        <div id="load-save-container" style={{ display: 'flex', flexDirection: 'row' }}>
            <ProfileMenuButtons
                user={null}
                handleOpen={handleOpen}
                handleSettingsOpen={handleSettingsOpen}
                loading={openLoadingSchedule}
            />

            <Dialog open={isOpen} onClose={() => handleClose(true)}>
                <DialogContent>
                    <Stack spacing={1}>
                        <SignInButton fullWidth />

                        <Box
                            onClick={() => setShowLegacyLogin(!showLegacyLogin)}
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                py: 1,
                                '&:hover': {
                                    opacity: 0.7,
                                },
                            }}
                        >
                            <Divider sx={{ flexGrow: 1 }}>Have schedules saved to an old user ID?</Divider>
                            <ExpandMore
                                sx={{
                                    transform: showLegacyLogin ? 'rotate(180deg)' : 'rotate(0deg)',
                                    transition: 'transform 0.2s',
                                    ml: 1,
                                }}
                            />
                        </Box>

                        <Collapse in={showLegacyLogin}>
                            <Stack spacing={1}>
                                <DialogContentText>
                                    Enter your unique user ID here to sign in your schedule.
                                </DialogContentText>

                                <Alert severity="info" variant={isDark ? 'outlined' : 'standard'}>
                                    <AlertTitle>
                                        Note: Existing schedules saved to a unique user ID can no longer be updated.
                                    </AlertTitle>
                                    Please sign up with your Google account to save your schedules.
                                </Alert>

                                <TextField
                                    margin="dense"
                                    label="Unique User ID"
                                    type="text"
                                    fullWidth
                                    placeholder="Enter here"
                                    color="secondary"
                                    value={userID}
                                    onChange={(event) => setUserID(event.target.value)}
                                />
                            </Stack>
                        </Collapse>
                    </Stack>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => handleClose(true)} color="inherit">
                        Cancel
                    </Button>
                    {showLegacyLogin && (
                        <Button onClick={() => handleClose(false)} color="inherit">
                            Sign in
                        </Button>
                    )}
                </DialogActions>
            </Dialog>

            <Popover
                open={Boolean(settingsAnchorEl)}
                anchorEl={settingsAnchorEl}
                onClose={() => setSettingsAnchorEl(null)}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: getSettingsPopoverPaperSx(isDark),
                    },
                }}
            >
                <SettingsMenu user={null} onClose={() => setSettingsAnchorEl(null)} />
                <Divider style={{ marginTop: '20px', marginBottom: '12px' }} />
                <MenuItem onClick={handleOpen} sx={{ px: 1, py: 1.25, borderRadius: 1 }}>
                    <ListItemIcon>
                        <AccountCircle />
                    </ListItemIcon>
                    <ListItemText
                        primary="Sign in"
                        primaryTypographyProps={{
                            sx: {
                                fontSize: '1rem',
                                fontWeight: 600,
                                textTransform: 'uppercase',
                            },
                        }}
                    />
                </MenuItem>
            </Popover>
            <SignInAlertDialog
                open={openAlert}
                title="This schedule was previously imported to a Google account. Did you want to sign in with Google?"
                onClose={() => setOpenalert(false)}
            />
        </div>
    );
};
