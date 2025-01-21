import { Dialog, DialogTitle, DialogContent, Stack } from '@mui/material';

interface AuthDialogProps {
    title: string;
    open: boolean;
    children?: React.ReactNode;
    onClose: () => void;
}

export function AuthDialog(props: AuthDialogProps) {
    const { title, onClose, children, open } = props;

    const handleClose = () => {
        onClose();
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth={'xl'}>
            <Stack spacing={0} sx={{ textAlign: 'center' }}>
                <DialogTitle fontSize={'large'}>{title}</DialogTitle>
                <DialogContent sx={{ width: '30rem', height: '13rem' }}>
                    <Stack spacing={2} sx={{ paddingTop: '1rem' }}>
                        {children}
                    </Stack>
                </DialogContent>
            </Stack>
        </Dialog>
    );
}
