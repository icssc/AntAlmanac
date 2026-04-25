import { SignInDialog } from '$components/dialogs/SignInDialog';
import { NotificationEmailTooltip } from '$components/RightPane/AddedCourses/Notifications/NotificationEmailTooltip';
import { NotificationsTabs } from '$components/RightPane/AddedCourses/Notifications/NotificationsTabs';
import { LIGHT_BLUE } from '$src/globals';
import { useSessionStore } from '$stores/SessionStore';
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
    useTheme,
} from '@mui/material';
import { useCallback, useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

interface NotificationsDialogProps {
    disabled?: boolean;
    buttonSx?: SxProps;
}

export function NotificationsDialog({ disabled, buttonSx }: NotificationsDialogProps) {
    const theme = useTheme();
    const [open, setOpen] = useState(false);
    const [signInOpen, setSignInOpen] = useState<boolean>(false);
    const isDark = useThemeStore((store) => store.isDark);

    const { isGoogleUser } = useSessionStore(
        useShallow((state) => ({
            isGoogleUser: state.isGoogleUser,
        }))
    );

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
                        <NotificationEmailTooltip />
                    </Box>
                </DialogTitle>
                <DialogContent
                    sx={
                        theme.palette.mode === 'dark'
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

            <SignInDialog isDark={isDark} open={signInOpen} onClose={handleSignInClose} feature="Notification" />
        </>
    );
}
