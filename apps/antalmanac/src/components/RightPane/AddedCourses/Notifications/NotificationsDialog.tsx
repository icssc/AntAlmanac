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
import { usePostHog } from 'posthog-js/react';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { NotificationEmailTooltip } from '$components/RightPane/AddedCourses/Notifications/NotificationEmailTooltip';
import { NotificationsTabs } from '$components/RightPane/AddedCourses/Notifications/NotificationsTabs';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const [open, setOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState<boolean>(false);
    const isDark = useThemeStore((store) => store.isDark);
    const postHog = usePostHog();

    const { session, isGoogleUser } = useSessionStore(
        useShallow((state) => ({
            session: state.session,
            isGoogleUser: state.isGoogleUser,
        }))
    );

    const handleOpen = useCallback(() => {
        if (isGoogleUser) {
            logAnalytics(postHog, {
                category: analyticsEnum.aants,
                action: analyticsEnum.aants.actions.OPEN_MANAGE_NOTIFICATIONS,
            });
            setOpen(true);
        } else {
            setSignInOpen(true);
        }
    }, [isGoogleUser, postHog]);

    const handleClose = useCallback(() => {
        logAnalytics(postHog, {
            category: analyticsEnum.aants,
            action: analyticsEnum.aants.actions.CLOSE_MANAGE_NOTIFICATIONS,
        });
        setOpen(false);
    }, [postHog]);

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
