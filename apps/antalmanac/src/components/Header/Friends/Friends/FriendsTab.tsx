import { FriendCard } from '$components/Header/Friends/Friends/FriendCard';
import { FriendSearch } from '$components/Header/Friends/Friends/FriendSearch';
import trpc from '$lib/api/trpc';
import type { Friend } from '$src/backend/lib/rds.types';
import { openSnackbar } from '$stores/SnackbarStore';
import { Box, Typography } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface FriendsTabProps {
    friends: Friend[];
    onRefresh: () => Promise<void>;
}

export function FriendsTab({ friends, onRefresh }: FriendsTabProps) {
    const navigate = useNavigate();

    const handleViewSchedule = async (friend: Friend) => {
        try {
            const data = await trpc.userData.getFriendUserData.query({ userId: friend.id });
            if (!data?.userData?.schedules?.length) {
                openSnackbar('warning', "This friend hasn't shared any schedules with you.");
                return;
            }
        } catch {
            openSnackbar('error', "Couldn't load this friend's schedules.");
            return;
        }
        navigate('/share/friend/' + encodeURIComponent(friend.id), {
            state: { friendName: friend.name ?? friend.email ?? 'Friend' },
        });
    };

    return (
        <Box>
            <FriendSearch friends={friends} onView={handleViewSchedule} onRefresh={onRefresh} />

            <Box>
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
