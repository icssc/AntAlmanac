import GoogleIcon from '@mui/icons-material/Google';
import { Alert, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState } from 'react';

import { loginUser } from '$actions/AppStoreActions';

interface SignInDialogProps {
    open: boolean;
    isDark: boolean;
    feature: 'Load' | 'Save' | 'Notification' | 'Friends';
    onClose: () => void;
}

export function SignInDialog(props: SignInDialogProps) {
    const { onClose, open, isDark, feature } = props;
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleClose = () => {
        onClose();
    };

    const handleSignIn = async () => {
        setIsLoggingIn(true);
        try {
            await loginUser();
        } catch {
            setIsLoggingIn(false);
        }
    };

    const title =
        feature === 'Notification'
            ? 'Sign in to Use Notifications'
            : feature === 'Friends'
              ? 'Sign in to Use Friends'
              : 'Save';

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={'xl'}
            fullScreen={true}
            sx={{
                '& .MuiDialog-paper': {
                    width: 'fit-content',
                    height: 'fit-content',
                    borderRadius: '0.5rem',
                },
                padding: '1rem',
            }}
        >
            <DialogTitle>{title}</DialogTitle>
            <DialogContent>
                {isLoggingIn ? (
                    <Stack alignItems="center" justifyContent="center" spacing={2} sx={{ py: 3, minWidth: 280 }}>
                        <CircularProgress />
                        <Typography variant="body2" color="text.secondary">
                            Redirecting to sign in…
                        </Typography>
                    </Stack>
                ) : (
                    <Stack spacing={1}>
                        {(feature === 'Save' || feature === 'Friends') && (
                            <Alert
                                severity="info"
                                variant={isDark ? 'outlined' : 'standard'}
                                sx={{ fontSize: 'small' }}
                            >
                                {feature === 'Save'
                                    ? 'All changes made will be saved to your Google account'
                                    : 'Sign in to add friends and share your schedule'}
                            </Alert>
                        )}
                        <Button
                            onClick={handleSignIn}
                            startIcon={<GoogleIcon />}
                            color="primary"
                            variant="contained"
                            size="large"
                        >
                            Sign in with Google
                        </Button>
                    </Stack>
                )}
            </DialogContent>
        </Dialog>
    );
}
