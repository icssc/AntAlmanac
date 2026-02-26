import { Notifications } from '@mui/icons-material';
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogActions,
    Button,
    IconButton,
    SxProps,
    Tooltip,
    Box,
    useTheme,
} from '@mui/material';
import { useCallback, useState, useEffect } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationEmailTooltip } from '$components/RightPane/AddedCourses/Notifications/NotificationEmailTooltip';
import { NotificationsTabs } from '$components/RightPane/AddedCourses/Notifications/NotificationsTabs';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import { LIGHT_BLUE } from '$src/globals';
import { useNotificationStore } from '$stores/NotificationStore';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const theme = useTheme();
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
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Manage Notifications
                        <NotificationEmailTooltip sessionToken={session} />
                    </Box>
                </DialogTitle>
                <DialogContent
                    sx={
                        theme.palette.mode === 'dark'
                            ? {
                                  '& a': { color: LIGHT_BLUE },
                                  '& .MuiTab-root.Mui-selected': { color: LIGHT_BLUE },
                                  '& .MuiTabs-indicator': { backgroundColor: LIGHT_BLUE },
                                  '& .MuiCheckbox-root.Mui-checked': { color: LIGHT_BLUE },
                              }
                            : undefined
                    }
                >
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
