import GoogleIcon from '@mui/icons-material/Google';
import { Button, Stack, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';

import { loginUser } from '$actions/AppStoreActions';

interface SignInDialogProps {
    open: boolean;
    isDark: boolean;
    action: 'Load' | 'Save' | 'Notification';
    onClose: () => void;
}

export function SignInDialog(props: SignInDialogProps) {
    const { onClose, open, isDark } = props;

    const handleClose = () => {
        onClose();
    };

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
            <DialogTitle>{props.action === 'Notification' ? 'Login to Use Notifications' : 'Save'}</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {props.action === 'Save' && (
                        <Alert severity="info" variant={isDark ? 'outlined' : 'standard'} sx={{ fontSize: 'small' }}>
                            All changes made will be saved to your Google account
                        </Alert>
                    )}
                    <Button
                        onClick={loginUser}
                        startIcon={<GoogleIcon />}
                        color="primary"
                        variant="contained"
                        size="large"
                    >
                        Sign in with Google
                    </Button>
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
