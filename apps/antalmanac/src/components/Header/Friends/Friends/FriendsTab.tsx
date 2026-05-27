import { FriendCard } from '$components/Header/Friends/Friends/FriendCard';
import { FriendSearch } from '$components/Header/Friends/Friends/FriendSearch';
import type { Friend } from '$src/backend/lib/rds.types';
import FriendsStore from '$stores/FriendsStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box, Typography } from '@mui/material';

interface FriendsTabProps {
    friends: Friend[];
    onRefresh: () => Promise<void>;
    onClose: () => void;
}

export function FriendsTab({ friends, onRefresh, onClose }: FriendsTabProps) {
    const handleViewSchedule = async (friend: Friend) => {
        onClose();

        const friendName = friend.name ?? friend.email ?? 'Friend';
        const success = await FriendsStore.openFriendView(friend.id, friendName);

        if (!success) {
            openSnackbar('warning', "This friend hasn't shared any schedules with you.");
        }
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <FriendSearch friends={friends} onView={handleViewSchedule} onRefresh={onRefresh} />

            <Box
                sx={{
                    mt: 2.5,
                    maxHeight: 360,
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                }}
            >
                {friends.length === 0 ? (
                    <Typography variant="body1" color="text.secondary">
                        No friends added yet
                    </Typography>
                ) : (
                    friends.map((friend) => (
                        <FriendCard key={friend.id} friend={friend} onView={handleViewSchedule} onRefresh={onRefresh} />
                    ))
                )}
            </Box>
        </Box>
    );
}
