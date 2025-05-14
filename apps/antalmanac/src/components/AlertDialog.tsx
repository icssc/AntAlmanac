import CloseIcon from '@mui/icons-material/Close';
import { Alert, Box, Dialog, DialogContent, AlertColor, IconButton } from '@mui/material';

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
                        '& .MuiAlert-action': {
                            alignSelf: 'center',
                            paddingTop: 0,
                            marginTop: 'auto',
                            marginBottom: 'auto',
                        },
                    }}
                    action={
                        <IconButton aria-label="close" color="inherit" size="medium" onClick={onClose}>
                            <CloseIcon fontSize="medium" />
                        </IconButton>
                    }
                >
                    {title}
                </Alert>
                {children && <Box paddingY="1.5rem">{children}</Box>}
            </DialogContent>
        </Dialog>
    );
};
