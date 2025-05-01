import { Alert, Button, Dialog, DialogContent, DialogActions } from '@mui/material';

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
            <DialogContent>
                <Alert severity={severity} variant="filled" sx={{ marginBottom: '1rem', alignItems: 'center' }}>
                    {title}
                </Alert>
                {children}
                {defaultAction && (
                    <DialogActions>
                        <Button onClick={onClose} color="inherit">
                            Close
                        </Button>
                    </DialogActions>
                )}
            </DialogContent>
        </Dialog>
    );
};
