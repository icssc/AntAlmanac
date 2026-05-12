import { AlertDialog } from '$components/AlertDialog';
import { SignInButtons } from '$components/buttons/SignInButtons/SignInButtons';
import { DialogContentText, Stack } from '@mui/material';
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
            <Stack spacing={1}>
                <SignInButtons />
            </Stack>
        </AlertDialog>
    );
};

export default SignInAlertDialog;
