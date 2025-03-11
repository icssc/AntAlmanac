import { Notifications } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, SxProps, Tooltip } from '@mui/material';
import { useCallback, useState, useEffect } from 'react';

import { NotificationsTabs } from '$components/RightPane/AddedCourses/NotificationsTabs';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const [open, setOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState<boolean>(false);
    const [googleUser, setGoogleUser] = useState<boolean>(false);
    const session = useSessionStore.getState();
    const isDark = useThemeStore((store) => store.isDark);

    useEffect(() => {
        const fetchUser = async () => {
            if (!session.session) {
                return;
            }

            try {
                const { users } = await trpc.userData.getUserAndAccountBySessionToken.query({
                    token: session.session ?? '',
                });

                if (users.email) {
                    setGoogleUser(true);
                }
            } catch (error) {
                console.error('Failed to fetch user data:', error);
            }
        };

        fetchUser();
    }, [session.session]);

    const handleOpen = useCallback(() => {
        if (googleUser) {
            setOpen(true);
        } else {
            setSignInOpen(true);
        }
    }, [googleUser]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleSignInClose = useCallback(() => {
        setSignInOpen(false);
    }, []);

    return (
        <>
            <Tooltip title={googleUser ? 'Notifications Menu' : 'Sign in to access notifications'}>
                <IconButton
                    sx={{
                        ...buttonSx,
                        opacity: googleUser ? 1 : 0.5,
                    }}
                    onClick={handleOpen}
                    size="small"
                    disabled={disabled}
                >
                    <Notifications />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Manage Active Course Notifications</DialogTitle>
                <DialogContent>
                    <NotificationsTabs />
                </DialogContent>
            </Dialog>

            <SignInDialog isDark={isDark} open={signInOpen} onClose={handleSignInClose} />
        </>
    );
}
