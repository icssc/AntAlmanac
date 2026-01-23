import { Alert, Box, Dialog, DialogContent, type AlertColor, DialogActions, Button } from '@mui/material';

import { useThemeStore } from '$stores/SettingsStore';

interface AlertDialogProps {
    open: boolean;
    title: string;
    children?: React.ReactNode;
    severity?: AlertColor;
    defaultAction?: boolean;
    onClose?: () => void;
}
export const AlertDialog = ({ open, title, children, severity = 'info', onClose }: AlertDialogProps) => {
    const isDark = useThemeStore((store) => store.isDark);
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogContent sx={{ fontSize: 'small' }}>
                <Alert
                    severity={severity}
                    variant={isDark ? 'outlined' : 'standard'}
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
