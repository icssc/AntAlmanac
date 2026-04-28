import { FriendsListSkeleton } from '$components/Header/Friends/FriendsListSkeleton';
import { FriendsTab } from '$components/Header/Friends/FriendsTab';
import { RequestsTab } from '$components/Header/Friends/RequestsTab';
import type { Friend, FriendRequest } from '$components/Header/Friends/types';
import trpc from '$lib/api/trpc';
import { openSnackbar } from '$stores/SnackbarStore';
import { PersonRemove, Block } from '@mui/icons-material';
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
    Tab,
    Tabs,
    Typography,
} from '@mui/material';
import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export type { Friend, FriendRequest };

export interface FriendsMenuProps {
    friendRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    friends: Friend[];
    blockedFriends: Friend[];
    isLoading: boolean;
    onRefresh: () => Promise<void>;
}

export function FriendsMenu({
    friendRequests,
    sentRequests,
    friends,
    blockedFriends,
    isLoading,
    onRefresh: loadFriendsData,
}: FriendsMenuProps) {
    const [activeTab, setActiveTab] = useState<'friends' | 'requests'>('friends');
    const [email, setEmail] = useState('');
    const [friendSearch, setFriendSearch] = useState('');
    const [friendDropdownOpen, setFriendDropdownOpen] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);
    const [blockMenuAnchor, setBlockMenuAnchor] = useState<{ element: HTMLElement; requestId: string } | null>(null);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [userToBlock, setUserToBlock] = useState<string | null>(null);
    const [friendMenuAnchor, setFriendMenuAnchor] = useState<{ element: HTMLElement; friendId: string } | null>(null);
    const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
    const [userToUnfriend, setUserToUnfriend] = useState<string | null>(null);
    const navigate = useNavigate();

    const handleAddFriend = async () => {
        const trimmed = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            openSnackbar('error', 'Please enter a valid email address.');
            return;
        }
        try {
            await trpc.friends.sendFriendRequestByEmail.mutate({ email: trimmed });
            openSnackbar('success', 'Friend request sent.');
            setEmail('');
            await loadFriendsData();
        } catch (error) {
            console.error('Error sending friend request:', error);
            const message = error instanceof Error ? error.message : 'Failed to send friend request.';
            openSnackbar('error', message);
        }
    };

    const handleAccept = async (requesterId: string) => {
        try {
            await trpc.friends.acceptFriendRequest.mutate({ requesterId });
            openSnackbar('success', 'Friend request accepted.');
            await loadFriendsData();
        } catch (error) {
            console.error('Error accepting friend request:', error);
            const message =
                error instanceof Error && error.message.includes('no longer exists')
                    ? 'This friend request is no longer available.'
                    : 'Failed to accept friend request.';
            openSnackbar('error', message);
            await loadFriendsData();
        }
    };

    const handleDecline = async (requesterId: string) => {
        try {
            await trpc.friends.removeFriend.mutate({ friendId: requesterId });
            openSnackbar('info', 'Friend request declined.');
            await loadFriendsData();
        } catch (error) {
            console.error('Error declining friend request:', error);
            openSnackbar('error', 'Failed to decline friend request.');
        }
    };

    const handleOpenBlockMenu = (event: React.MouseEvent<HTMLElement>, requestId: string) => {
        setBlockMenuAnchor({ element: event.currentTarget, requestId });
    };

    const handleBlockClick = () => {
        if (blockMenuAnchor) {
            setUserToBlock(blockMenuAnchor.requestId);
            setBlockDialogOpen(true);
            setBlockMenuAnchor(null);
        }
    };

    const handleConfirmBlock = async () => {
        if (!userToBlock) return;
        try {
            await trpc.friends.blockUser.mutate({ blockId: userToBlock });
            openSnackbar('info', 'User blocked.');
            setUserToBlock(null);
            setBlockDialogOpen(false);
            await loadFriendsData();
        } catch (error) {
            console.error('Error blocking user:', error);
            openSnackbar('error', 'Failed to block user.');
        }
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
            state: { friendName: friend.name ?? friend.email },
        });
    };

    const handleOpenFriendMenu = (event: React.MouseEvent<HTMLElement>, friendId: string) => {
        setFriendMenuAnchor({ element: event.currentTarget, friendId });
    };

    const handleUnfriendClick = () => {
        if (!friendMenuAnchor) return;
        setUserToUnfriend(friendMenuAnchor.friendId);
        setUnfriendDialogOpen(true);
        setFriendMenuAnchor(null);
    };

    const handleConfirmUnfriend = async () => {
        if (!userToUnfriend) return;
        try {
            await trpc.friends.removeFriend.mutate({ friendId: userToUnfriend });
            openSnackbar('info', 'Friend removed.');
            setUserToUnfriend(null);
            setUnfriendDialogOpen(false);
            await loadFriendsData();
        } catch (error) {
            console.error('Error removing friend:', error);
            openSnackbar('error', 'Failed to remove friend.');
        }
    };

    const handleUnblock = async (blockedId: string) => {
        try {
            await trpc.friends.unblockUser.mutate({ blockId: blockedId });
            openSnackbar('info', 'User unblocked.');
            await loadFriendsData();
        } catch (error) {
            console.error('Error unblocking user:', error);
            openSnackbar('error', 'Failed to unblock user.');
        }
    };

    if (isLoading) {
        return <FriendsListSkeleton />;
    }

    return (
        <>
            <Box sx={{ minWidth: '300px' }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 700, mb: 1, letterSpacing: '0.5px' }}>
                    Manage Friends
                </Typography>

                <Tabs
                    value={activeTab}
                    onChange={(_, v) => setActiveTab(v)}
                    variant="fullWidth"
                    textColor="inherit"
                    sx={(theme) => ({
                        mb: 1,
                        '& .MuiTab-root': { color: theme.palette.mode === 'dark' ? '#C7C7C7' : '#606166' },
                        '& .MuiTab-root.Mui-selected': {
                            color: theme.palette.mode === 'dark' ? '#90B3FA' : theme.palette.primary.main,
                        },
                        '& .MuiTabs-indicator': {
                            bgcolor: theme.palette.mode === 'dark' ? '#90B3FA' : theme.palette.primary.main,
                        },
                    })}
                >
                    <Tab label="Friends" value="friends" />
                    <Tab
                        label={
                            friendRequests.length > 0 ? (
                                <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                    Requests ({friendRequests.length})
                                </Typography>
                            ) : (
                                'Requests'
                            )
                        }
                        value="requests"
                    />
                </Tabs>

                {activeTab === 'friends' && (
                    <FriendsTab
                        friends={friends}
                        searchRef={searchRef}
                        friendSearch={friendSearch}
                        onSearchChange={setFriendSearch}
                        dropdownOpen={friendDropdownOpen || Boolean(friendMenuAnchor)}
                        onDropdownOpen={() => setFriendDropdownOpen(true)}
                        onDropdownClose={() => setFriendDropdownOpen(false)}
                        onView={handleViewSchedule}
                        onOpenMenu={handleOpenFriendMenu}
                    />
                )}

                {activeTab === 'requests' && (
                    <RequestsTab
                        email={email}
                        onEmailChange={setEmail}
                        onAddFriend={handleAddFriend}
                        friendRequests={friendRequests}
                        sentRequests={sentRequests}
                        blockedFriends={blockedFriends}
                        onAccept={handleAccept}
                        onDecline={handleDecline}
                        onOpenBlockMenu={handleOpenBlockMenu}
                        onUnblock={handleUnblock}
                        onCancelRequest={handleDecline}
                    />
                )}
            </Box>

            <Menu
                anchorEl={blockMenuAnchor?.element}
                open={Boolean(blockMenuAnchor)}
                onClose={() => setBlockMenuAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={handleBlockClick} sx={{ color: 'error.main' }}>
                    <Block sx={{ mr: 1, fontSize: '1.25rem' }} />
                    Block User
                </MenuItem>
            </Menu>

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
                <MenuItem
                    onClick={() => {
                        if (friendMenuAnchor) {
                            setUserToBlock(friendMenuAnchor.friendId);
                            setBlockDialogOpen(true);
                            setFriendMenuAnchor(null);
                        }
                    }}
                    sx={{ color: 'error.main' }}
                >
                    <Block sx={{ mr: 1, fontSize: '1.25rem' }} />
                    Block User
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

            <Dialog open={blockDialogOpen} onClose={() => setBlockDialogOpen(false)}>
                <DialogTitle>Block User?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to block this user? They will no longer be able to send you friend
                        requests.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={() => {
                            setUserToBlock(null);
                            setBlockDialogOpen(false);
                        }}
                        color="inherit"
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmBlock} color="primary" variant="contained">
                        Block
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
