import { Notifications } from '@mui/icons-material';
import { Dialog, DialogContent, DialogTitle, IconButton, SxProps, Tooltip } from '@mui/material';
import { useCallback, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationsTabs } from '$components/RightPane/AddedCourses/Notifications/NotificationsTabs';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import { useNotificationStore } from '$stores/NotificationStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const [open, setOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState<boolean>(false);
    const loadNotifications = useNotificationStore(useShallow((store) => store.loadNotifications));
    const isDark = useThemeStore((store) => store.isDark);

    const { session, isGoogleUser, fetchUserData } = useSessionStore(
        useShallow((state) => ({
            session: state.session,
            isGoogleUser: state.isGoogleUser,
            fetchUserData: state.fetchUserData,
        }))
    );

    useEffect(() => {
        if (isGoogleUser) {
            loadNotifications();
        }
    }, [isGoogleUser, loadNotifications]);

    useEffect(() => {
        fetchUserData(session);
    }, [session, fetchUserData]);

    const handleOpen = useCallback(() => {
        if (isGoogleUser) {
            setOpen(true);
        } else {
            setSignInOpen(true);
        }
    }, [isGoogleUser]);

    const handleClose = useCallback(() => {
        setOpen(false);
    }, []);

    const handleSignInClose = useCallback(() => {
        setSignInOpen(false);
    }, []);

    return (
        <>
            <Tooltip title={isGoogleUser ? 'Notifications Menu' : 'Sign in to access notifications'}>
                <IconButton
                    sx={{
                        ...buttonSx,
                        opacity: isGoogleUser ? 1 : 0.5,
                    }}
                    onClick={handleOpen}
                    size="small"
                    disabled={disabled}
                >
                    <Notifications />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} fullWidth>
                <DialogTitle>Manage Notifications</DialogTitle>
                <DialogContent>
                    <NotificationsTabs />
                </DialogContent>
            </Dialog>

            <SignInDialog isDark={isDark} open={signInOpen} onClose={handleSignInClose} feature="Notification" />
        </>
    );
}
