import { FriendAvatar } from '$components/Header/Friends/FriendAvatar';
import { trpc } from '$lib/api/trpc';
import type { FriendRequest } from '$src/backend/lib/rds.types';
import { openSnackbar } from '$stores/SnackbarStore';
import { Button, Card } from '@mui/material';

interface SentRequestCardProps {
    request: FriendRequest;
    onRefresh: () => Promise<void>;
}

export function SentRequestCard({ request, onRefresh }: SentRequestCardProps) {
    const handleCancelRequest = async () => {
        try {
            await trpc.friends.removeFriend.mutate({ friendId: request.id });
            openSnackbar('info', 'Friend request cancelled.');
            await onRefresh();
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            openSnackbar('error', 'Failed to cancel friend request.');
        }
    };

    return (
        <Card
            variant="outlined"
            sx={{
                p: 1,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                width: '100%',
            }}
        >
            <FriendAvatar name={request.name} email={request.email} avatar={request.avatar} />
            <Button size="small" variant="contained" color="error" onClick={handleCancelRequest}>
                Unrequest
            </Button>
        </Card>
    );
}
