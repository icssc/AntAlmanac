import { SignInDialog } from '$components/dialogs/SignInDialog';
import { NotificationEmailTooltip } from '$components/RightPane/AddedCourses/Notifications/NotificationEmailTooltip';
import { NotificationsTabs } from '$components/RightPane/AddedCourses/Notifications/NotificationsTabs';
import analyticsEnum, { logAnalytics } from '$lib/analytics/analytics';
import { useAuth } from '$lib/auth/useAuth';
import { LIGHT_BLUE } from '$src/globals';
import { useThemeStore } from '$stores/SettingsStore';
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

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const isDark = useThemeStore((store) => store.isDark);
    const [open, setOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState<boolean>(false);
    const postHog = usePostHog();

    const { isLoggedIn } = useAuth();

    const handleOpen = useCallback(() => {
        if (isLoggedIn) {
            logAnalytics(postHog, {
                category: analyticsEnum.aants,
                action: analyticsEnum.aants.actions.OPEN_MANAGE_NOTIFICATIONS,
            });
            setOpen(true);
        } else {
            setSignInOpen(true);
        }
    }, [isLoggedIn, postHog]);

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
            <Tooltip title={isLoggedIn ? 'Notifications Menu' : 'Sign in to access notifications'}>
                <IconButton
                    sx={{
                        ...buttonSx,
                        opacity: isLoggedIn ? 1 : 0.5,
                    }}
                    onClick={handleOpen}
                    size="small"
                    disabled={disabled}
                >
                    <Notifications />
                </IconButton>
            </Tooltip>

            <Dialog open={open} onClose={handleClose} fullWidth maxWidth="lg">
                <DialogTitle>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        Manage Notifications
                        <NotificationEmailTooltip />
                    </Box>
                </DialogTitle>
                <DialogContent
                    sx={
                        isDark
                            ? {
                                  '& a, & a:hover, & a:visited': { color: LIGHT_BLUE },
                                  '& .MuiTab-root': { color: 'text.secondary' },
                                  '& .MuiTab-root.Mui-selected': { color: LIGHT_BLUE },
                                  '& .MuiTabs-indicator': { backgroundColor: LIGHT_BLUE },
                                  '& .MuiCheckbox-root.Mui-checked': { color: LIGHT_BLUE },
                                  '& .MuiChip-label': { color: 'text.primary' },
                                  '& .MuiTablePagination-actions .MuiIconButton-root': {
                                      color: 'text.primary',
                                  },
                                  '& .MuiTablePagination-selectIcon': { color: 'text.primary' },
                              }
                            : undefined
                    }
                >
                    <NotificationsTabs />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="inherit">
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            <SignInDialog open={signInOpen} onClose={handleSignInClose} feature="Notification" />
        </>
    );
}
