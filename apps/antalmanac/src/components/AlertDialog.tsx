import { Alert, AlertColor, Box, Button, Dialog, DialogActions, DialogContent } from '@mui/material';

interface AlertDialogProps {
    open: boolean;
    title: string;
    children?: React.ReactNode;
    severity?: AlertColor;
    defaultAction?: boolean;
    onClose?: () => void;
}
export const AlertDialog = ({ open, title, children, severity = 'info', onClose }: AlertDialogProps) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ fontSize: 'small' }}>
                <Alert
                    severity={severity}
                    variant="filled"
                    sx={{
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 'medium',
                    }}
                >
                    {title}
                </Alert>
                {children && <Box paddingTop="1.5rem">{children}</Box>}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Close
                </Button>
            </DialogActions>
        </Dialog>
    );
};
