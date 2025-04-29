import { Alert, AlertTitle, Button, Dialog, DialogActions } from '@mui/material';

interface AlertDialogProps {
    open: boolean;
    title: string;
    children: React.ReactNode;
    severity?: 'error' | 'info' | 'success' | 'warning';
    defaultAction?: boolean;
    onClose?: () => void;
}
export const AlertDialog = ({
    open,
    title,
    children,
    severity = 'info',
    onClose,
    defaultAction = false,
}: AlertDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <Alert severity={severity}>
                <AlertTitle fontSize={'small'}>{title}</AlertTitle>
                {children}
                {defaultAction && (
                    <DialogActions>
                        <Button onClick={onClose} color="inherit">
                            Close
                        </Button>
                    </DialogActions>
                )}
            </Alert>
        </Dialog>
    );
};
