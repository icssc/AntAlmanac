import { Alert, Box, Dialog, DialogContent, AlertColor, DialogActions, Button } from '@mui/material';

import { DARK_PAPER_BG, LIGHT_BLUE } from '$src/globals';
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
        <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
                sx: {
                    ...(isDark && { bgcolor: DARK_PAPER_BG, color: 'text.primary' }),
                },
            }}
        >
            <DialogContent
                sx={{
                    fontSize: 'small',
                    ...(isDark && { '& a, & a:hover, & a:visited': { color: LIGHT_BLUE } }),
                }}
            >
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
