import { AlertDialog } from '$components/AlertDialog';
import SignInButton from '$components/buttons/SignInButton';
import { DialogContentText } from '@mui/material';
import { ComponentProps } from 'react';

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
            <SignInButton fullWidth />
        </AlertDialog>
    );
};

export default SignInAlertDialog;
