import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from '@material-ui/core';
import { Alert } from '@mui/material';

interface AlertDialogProps {
    open: boolean;
    title: string;
    children: React.ReactNode;
    severity?: 'error' | 'info' | 'success' | 'warning';
    onClose: () => void;
}
export const AlertDialog = ({ open, title, children, severity = 'info', onClose }: AlertDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <Alert severity={severity}>
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    {children}
                    <DialogActions>
                        <Button onClick={onClose} color="inherit">
                            Close
                        </Button>
                    </DialogActions>
                </DialogContent>
            </Alert>
        </Dialog>
    );
};
