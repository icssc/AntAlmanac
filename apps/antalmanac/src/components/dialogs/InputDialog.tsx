import { Dialog, DialogTitle, DialogContent } from '@mui/material';

interface InputDialogProps {
    title: string;
    open: boolean;
    children?: React.ReactNode;
    onClose?: () => void; // not providing this prop will prevent the dialog from closing when clicking outside of it
}

export function InputDialog(props: InputDialogProps) {
    const { title, onClose, children, open } = props;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth={'xl'}
            fullScreen={true}
            sx={{
                '& .MuiDialog-paper': {
                    width: { xs: '45%', lg: '30%' },
                    height: 'fit-content',
                    borderRadius: '0.5rem',
                },
                padding: '1rem',
            }}
        >
            <DialogTitle fontSize={'medium'}>{title}</DialogTitle>
            <DialogContent sx={{ width: '100%' }}>{children}</DialogContent>
        </Dialog>
    );
}
