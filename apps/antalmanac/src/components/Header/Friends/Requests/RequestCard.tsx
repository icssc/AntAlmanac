import { FriendAvatar } from '$components/Header/Friends/FriendAvatar';
import trpc from '$lib/api/trpc';
import type { FriendRequest } from '$src/backend/lib/rds.types';
import { openSnackbar } from '$stores/SnackbarStore';
import { Button, Card, Stack } from '@mui/material';

interface RequestCardProps {
    request: FriendRequest;
    onRefresh: () => Promise<void>;
}

export function RequestCard({ request, onRefresh }: RequestCardProps) {
    const handleAccept = async () => {
        try {
            await trpc.friends.acceptFriendRequest.mutate({ requesterId: request.id });
            openSnackbar('success', 'Friend request accepted.');
            await onRefresh();
        } catch (error) {
            console.error('Error accepting friend request:', error);
            const message =
                error instanceof Error && error.message.includes('no longer exists')
                    ? 'This friend request is no longer available.'
                    : 'Failed to accept friend request.';
            openSnackbar('error', message);
            await onRefresh();
        }
    };

    const handleDecline = async () => {
        try {
            await trpc.friends.removeFriend.mutate({ friendId: request.id });
            openSnackbar('info', 'Friend request declined.');
            await onRefresh();
        } catch (error) {
            console.error('Error declining friend request:', error);
            openSnackbar('error', 'Failed to decline friend request.');
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
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Button size="small" variant="contained" onClick={handleAccept}>
                    Accept
                </Button>
                <Button size="small" variant="contained" color="error" onClick={handleDecline}>
                    Reject
                </Button>
            </Stack>
        </Card>
    );
}
