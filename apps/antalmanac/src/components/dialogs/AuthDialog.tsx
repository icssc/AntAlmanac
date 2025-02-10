import { Dialog, DialogTitle, DialogContent } from '@mui/material';

interface AuthDialogProps {
    title: string;
    open: boolean;
    children?: React.ReactNode;
    onClose?: () => void; // not providing this prop will prevent the dialog from closing when clicking outside of it
}

export function AuthDialog(props: AuthDialogProps) {
    const { title, onClose, children, open } = props;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={'xl'}
            fullScreen={true}
            sx={{
                '& .MuiDialog-paper': {
                    width: { xs: '50%' },
                    height: 'fit-content',
                },
                padding: '1rem',
            }}
        >
            <DialogTitle fontSize={'large'}>{title}</DialogTitle>
            <DialogContent sx={{ width: '100%' }}>{children}</DialogContent>
        </Dialog>
    );
}
