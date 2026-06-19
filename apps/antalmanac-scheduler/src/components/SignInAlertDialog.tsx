import { AlertDialog } from '$components/AlertDialog';
import { SignInButtons } from '$components/buttons/SignInButtons/SignInButtons';
import { DialogContentText, Stack } from '@mui/material';
import { type ComponentProps } from 'react';

interface Props {
    open: boolean;
    title: string;
    severity?: ComponentProps<typeof AlertDialog>['severity'];
    onClose: () => void;
}

export const SignInAlertDialog = ({ open, title, severity = 'info', onClose }: Props) => {
    return (
        <AlertDialog open={open} onClose={onClose} title={title} severity={severity}>
            <DialogContentText sx={{ mb: 1 }}>Sign in to load your schedule</DialogContentText>
            <Stack spacing={1}>
                <SignInButtons />
            </Stack>
        </AlertDialog>
    );
};
