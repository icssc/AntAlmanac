import GoogleIcon from '@mui/icons-material/Google';
import { Button, Stack, Dialog, DialogTitle, DialogContent } from '@mui/material';

import { isEmptySchedule, openSnackbar, loginUser } from '$actions/AppStoreActions';
import AppStore from '$stores/AppStore';

interface SignInDialogProps {
    open: boolean;
    isDark: boolean;
    action: 'Load' | 'Save';
    onClose: () => void;
}

export function SignInDialog(props: SignInDialogProps) {
    const { onClose, open, action } = props;

    const handleClose = () => {
        onClose();
    };

    if (isEmptySchedule(AppStore.schedule.getScheduleAsSaveState().schedules) && open && action === 'Save') {
        openSnackbar('info', 'Please create a schedule before signing in.');
        handleClose();
        return;
    }
    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={'xl'}
            fullScreen={true}
            sx={{
                '& .MuiDialog-paper': {
                    width: { xs: '45%', lg: '25%' },
                    height: 'fit-content',
                    borderRadius: '0.5rem',
                },
                padding: '1rem',
            }}
        >
            <DialogTitle>Save to your Google account</DialogTitle>
            <DialogContent>
                <Stack>
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
