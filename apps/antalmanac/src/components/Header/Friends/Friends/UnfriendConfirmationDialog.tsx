import { trpc } from '$lib/api/trpc';
import { openSnackbar } from '$stores/SnackbarStore';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';

interface UnfriendConfirmationDialogProps {
    friendId: string;
    open: boolean;
    onClose: () => void;
    onRefresh: () => Promise<void>;
}

export function UnfriendConfirmationDialog({ friendId, open, onClose, onRefresh }: UnfriendConfirmationDialogProps) {
    const handleConfirmUnfriend = async () => {
        try {
            await trpc.friends.removeFriend.mutate({ friendId });
            openSnackbar('info', 'Friend removed.');
            onClose();
            await onRefresh();
        } catch (error) {
            console.error('Error removing friend:', error);
            openSnackbar('error', 'Failed to remove friend.');
        }
    };

    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>Remove Friend?</DialogTitle>
            <DialogContent>
                <DialogContentText>Are you sure you want to remove this friend?</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>
                <Button onClick={handleConfirmUnfriend} color="primary" variant="contained">
                    Remove
                </Button>
            </DialogActions>
        </Dialog>
    );
}
