import { Notifications } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    type SxProps,
    Tooltip,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationEmailTooltip } from '$components/RightPane/AddedCourses/Notifications/NotificationEmailTooltip';
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

    const { session, isGoogleUser } = useSessionStore(
        useShallow((state) => ({
            session: state.session,
            isGoogleUser: state.isGoogleUser,
        }))
    );

    useEffect(() => {
        if (isGoogleUser) {
            loadNotifications();
        }
    }, [isGoogleUser, loadNotifications]);

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
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Manage Notifications
                        <NotificationEmailTooltip sessionToken={session} />
                    </Box>
                </DialogTitle>
                <DialogContent>
                    <NotificationsTabs />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} variant="text" sx={{ color: 'white' }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <SignInDialog isDark={isDark} open={signInOpen} onClose={handleSignInClose} feature="Notification" />
        </>
    );
}
