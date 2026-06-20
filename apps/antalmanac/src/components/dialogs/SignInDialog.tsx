import { SignInButtons } from '$components/buttons/SignInButtons/SignInButtons';
import { useIsDarkMode } from '$hooks/useIsDarkMode';
import { Stack, Dialog, DialogTitle, DialogContent, Alert } from '@mui/material';

interface SignInDialogProps {
    open: boolean;
    feature: 'Save' | 'Notification' | 'Planner' | 'PlannerSearch';
    onClose: () => void;
}

export function SignInDialog(props: SignInDialogProps) {
    const { onClose, open } = props;
    const isDark = useIsDarkMode();

    const handleClose = () => {
        onClose();
    };

    const getTitle = () => {
        switch (props.feature) {
            case 'Notification':
                return 'Sign in to Use Notifications';
            case 'Planner':
                return 'Sign in to Use Filter by Planner';
            case 'PlannerSearch':
                return 'Sign in to search with Planner';
            case 'Save':
            default:
                return 'Save';
        }
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth={'xl'}
            fullScreen={true}
            PaperProps={{
                sx: {
                    width: 'fit-content',
                    height: 'fit-content',
                    borderRadius: '0.5rem',
                },
            }}
            sx={{ padding: '1rem' }}
        >
            <DialogTitle>{getTitle()}</DialogTitle>
            <DialogContent>
                <Stack spacing={1}>
                    {props.feature === 'Save' && (
                        <Alert severity="info" variant={isDark ? 'outlined' : 'standard'} sx={{ fontSize: 'small' }}>
                            All changes made will be saved to your account
                        </Alert>
                    )}
                    <SignInButtons />
                </Stack>
            </DialogContent>
        </Dialog>
    );
}
