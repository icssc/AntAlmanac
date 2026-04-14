import { Google } from '@mui/icons-material';
import { DialogContentText, Button } from '@mui/material';
import { ComponentProps } from 'react';

import { loginUser } from '$actions/AppStoreActions';
import { AlertDialog } from '$components/AlertDialog';

interface Props {
    open: boolean;
    title: string;
    severity?: ComponentProps<typeof AlertDialog>['severity'];
    onClose: () => void;
}

const SignInAlertDialog = ({ open, title, severity = 'info', onClose }: Props) => {
    return (
        <AlertDialog open={open} onClose={onClose} title={title} severity={severity}>
            <DialogContentText>To load your schedule sign in with your Google account</DialogContentText>
            <Button
                color="primary"
                variant="contained"
                startIcon={<Google />}
                fullWidth
                onClick={loginUser}
                size="large"
            >
                Sign in with Google
            </Button>
        </AlertDialog>
    );
};

export default SignInAlertDialog;
