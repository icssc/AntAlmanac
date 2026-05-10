import { loginUser } from '$actions/AppStoreActions';
import { useThemeStore } from '$stores/SettingsStore';
import { Apple as AppleIcon, Google as GoogleIcon } from '@mui/icons-material';
import { Button, Stack, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';
import { usePostHog } from 'posthog-js/react';

interface SignInDialogProps {
    open: boolean;
    feature: 'Load' | 'Save' | 'Notification' | 'Planner' | 'PlannerSearch';
    onClose: () => void;
}

export function SignInDialog(props: SignInDialogProps) {
    const { onClose, open } = props;
    const isDark = useThemeStore((store) => store.isDark);
    const postHog = usePostHog();

    const handleClose = () => {
        onClose();
    };

    const getTitle = () => {
        switch (props.feature) {
            case 'Notification':
                return 'Sign in to Use Notifications';
            case 'Planner':
                return 'Sign in to Use Filter by Planner';
            case 'PlannerSearch':
                return 'Sign in to search with Planner';
            case 'Save':
            default:
                return 'Save';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={'xl'}
            fullScreen={true}
            PaperProps={{
                sx: {
                    width: 'fit-content',
                    height: 'fit-content',
                    borderRadius: '0.5rem',
                },
            }}
            sx={{ padding: '1rem' }}
        >
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {props.feature === 'Save' && (
                        <Alert severity="info" variant={isDark ? 'outlined' : 'standard'} sx={{ fontSize: 'small' }}>
                            All changes made will be saved to your account
                        </Alert>
                    )}
                    <Button
                        onClick={() => loginUser({ provider: 'google', postHog })}
                        startIcon={<GoogleIcon />}
                        color="primary"
                        variant="contained"
                        size="large"
                    >
                        Sign in with Google
                    </Button>
                    <Button
                        onClick={() => loginUser({ provider: 'apple', postHog })}
                        startIcon={<AppleIcon />}
                        variant="contained"
                        size="large"
                        sx={{
                            backgroundColor: isDark ? '#fff' : '#000',
                            color: isDark ? '#000' : '#fff',
                            '&:hover': {
                                backgroundColor: isDark ? '#e0e0e0' : '#333',
                            },
                        }}
                    >
                        Sign in with Apple
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
