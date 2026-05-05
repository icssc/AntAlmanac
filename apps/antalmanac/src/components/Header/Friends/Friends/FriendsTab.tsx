import { FriendCard } from '$components/Header/Friends/Friends/FriendCard';
import { FriendSearchDropdown } from '$components/Header/Friends/Friends/FriendSearchDropdown';
import { textFieldSx } from '$components/Header/Friends/styles';
import trpc from '$lib/api/trpc';
import type { Friend } from '$src/backend/lib/rds.types';
import { openSnackbar } from '$stores/SnackbarStore';
import { PersonRemove } from '@mui/icons-material';
import {
    Box,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
    Menu,
    MenuItem,
    TextField,
    Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface FriendsTabProps {
    friends: Friend[];
    onRefresh: () => Promise<void>;
}

export function FriendsTab({ friends, onRefresh }: FriendsTabProps) {
    const navigate = useNavigate();

    const [friendSearch, setFriendSearch] = useState('');
    const [friendDropdownOpen, setFriendDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [friendMenuAnchor, setFriendMenuAnchor] = useState<{ element: HTMLElement; friendId: string } | null>(null);
    const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
    const [userToUnfriend, setUserToUnfriend] = useState<string | null>(null);

    const handleOpenFriendMenu = (event: React.MouseEvent<HTMLElement>, friendId: string) => {
        setFriendMenuAnchor({ element: event.currentTarget, friendId });
    };

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

    const handleUnfriendClick = () => {
        if (!friendMenuAnchor) return;
        setUserToUnfriend(friendMenuAnchor.friendId);
        setUnfriendDialogOpen(true);
        setFriendMenuAnchor(null);
        setFriendDropdownOpen(false);
    };

    const handleConfirmUnfriend = async () => {
        if (!userToUnfriend) return;
        try {
            await trpc.friends.removeFriend.mutate({ friendId: userToUnfriend });
            openSnackbar('info', 'Friend removed.');
            setUserToUnfriend(null);
            setUnfriendDialogOpen(false);
            await onRefresh();
        } catch (error) {
            console.error('Error removing friend:', error);
            openSnackbar('error', 'Failed to remove friend.');
        }
    };

    return (
        <>
            <Box sx={{ mt: 1 }}>
                <Box ref={searchRef} sx={{ mt: 2 }}>
                    <TextField
                        variant="standard"
                        size="small"
                        placeholder="Search friend by name or email"
                        autoComplete="off"
                        value={friendSearch}
                        onChange={(e) => {
                            setFriendSearch(e.target.value);
                            setFriendDropdownOpen(true);
                        }}
                        onFocus={() => {
                            if (friendSearch.trim()) setFriendDropdownOpen(true);
                        }}
                        onBlur={() => setTimeout(() => setFriendDropdownOpen(false), 150)}
                        fullWidth
                        sx={[{ mb: 0.5 }, textFieldSx]}
                    />
                </Box>

                <FriendSearchDropdown
                    anchorEl={searchRef.current}
                    open={friendDropdownOpen || Boolean(friendMenuAnchor)}
                    friends={friends}
                    query={friendSearch}
                    onView={handleViewSchedule}
                    onOpenMenu={handleOpenFriendMenu}
                />

                <Box
                    sx={{
                        mt: 1,
                        maxHeight: 320,
                        overflowY: 'auto',
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-track': { background: 'none', boxShadow: 'none', border: 'none' },
                        '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'action.disabled' },
                    }}
                >
                    {friends.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 2, pl: 0.5, fontSize: '1rem' }}>
                            No friends yet
                        </Typography>
                    ) : (
                        friends.map((friend) => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                onView={handleViewSchedule}
                                onOpenMenu={handleOpenFriendMenu}
                            />
                        ))
                    )}
                </Box>
            </Box>

            <Menu
                anchorEl={friendMenuAnchor?.element}
                open={Boolean(friendMenuAnchor)}
                onClose={() => {
                    setFriendMenuAnchor(null);
                    setFriendDropdownOpen(false);
                }}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { zIndex: 10000 } } }}
                style={{ zIndex: 10000 }}
            >
                <MenuItem onClick={handleUnfriendClick} sx={{ color: 'error.main' }}>
                    <PersonRemove sx={{ mr: 1, fontSize: '1.25rem' }} />
                    Unfriend
                </MenuItem>
            </Menu>

            <Dialog open={unfriendDialogOpen} onClose={() => setUnfriendDialogOpen(false)}>
                <DialogTitle>Remove Friend?</DialogTitle>
                <DialogContent>
                    <DialogContentText>Are you sure you want to remove this friend?</DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setUserToUnfriend(null);
                            setUnfriendDialogOpen(false);
                        }}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmUnfriend} color="primary" variant="contained">
                        Remove
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
