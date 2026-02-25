import { PersonAdd, Block, MoreVert } from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Skeleton,
    Stack,
    Tab,
    Tabs,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { openSnackbar } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { useThemeStore } from '$stores/SettingsStore';

export interface FriendRequest {
    id: string;
    name?: string;
    email: string;
}

export interface Friend {
    id: string;
    name?: string;
    email: string;
}

function FriendsListSkeleton() {
    return (
        <Box>
            <Box sx={{ mb: 2 }}>
                <Skeleton variant="text" width={100} height={24} sx={{ mb: 1 }} />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                    <Skeleton variant="rounded" height={40} sx={{ flex: 1 }} />
                    <Skeleton variant="circular" width={40} height={40} />
                </Stack>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Tabs value="friends" variant="fullWidth" sx={{ mb: 1 }}>
                <Tab label="Requests" value="requests" disabled />
                <Tab label="Friends" value="friends" disabled />
                <Tab label="Blocked" value="blocked" disabled />
            </Tabs>
            <Box sx={{ mt: 1 }}>
                {[1, 2, 3].map((i) => (
                    <Box
                        key={i}
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.5,
                            mb: 1,
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'divider',
                        }}
                    >
                        <Stack direction="row" alignItems="center" flex={1} spacing={1}>
                            <Box sx={{ minWidth: 0, flex: 1 }}>
                                <Skeleton variant="text" width="70%" height={20} />
                                <Skeleton variant="text" width="50%" height={16} sx={{ mt: 0.5 }} />
                            </Box>
                        </Stack>
                        <Stack direction="row" spacing={0.5} alignItems="center">
                            <Skeleton variant="rounded" width={100} height={32} />
                            <Skeleton variant="circular" width={32} height={32} sx={{ ml: 0.5 }} />
                        </Stack>
                    </Box>
                ))}
            </Box>
        </Box>
    );
}

export interface FriendsMenuProps {
    currentUserId: string | null;
    friendRequests: FriendRequest[];
    friends: Friend[];
    blockedFriends: Friend[];
    isLoading: boolean;
    onRefresh: () => Promise<void>;
}

export function FriendsMenu({
    currentUserId,
    friendRequests,
    friends,
    blockedFriends,
    isLoading,
    onRefresh: loadFriendsData,
}: FriendsMenuProps) {
    const isDark = useThemeStore((store) => store.isDark);
    const hasPendingRequests = friendRequests.length > 0;
    const [activeTab, setActiveTab] = useState<'requests' | 'friends' | 'blocked'>('friends');
    const [email, setEmail] = useState('');
    const [blockMenuAnchor, setBlockMenuAnchor] = useState<{ element: HTMLElement; requestId: string } | null>(null);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [userToBlock, setUserToBlock] = useState<string | null>(null);
    const [friendMenuAnchor, setFriendMenuAnchor] = useState<{ element: HTMLElement; friendId: string } | null>(null);
    const navigate = useNavigate();

    const handleAddFriend = async () => {
        if (!currentUserId) {
            openSnackbar('warning', 'You must be signed in to add friends.');
            return;
        }

        try {
            await trpc.friends.sendFriendRequestByEmail.mutate({
                requesterId: currentUserId,
                email: email.trim(),
            });

            openSnackbar('success', 'Friend request sent.');
            setEmail('');
            await loadFriendsData();
        } catch (error) {
            console.error('Error sending friend request:', error);
            const message =
                error instanceof Error && error.message.includes('Invalid email')
                    ? 'Invalid email.'
                    : error instanceof Error
                      ? error.message
                      : 'Failed to send friend request.';
            openSnackbar('error', message);
        }
    };

    const handleAccept = async (requesterId: string) => {
        if (!currentUserId) {
            return;
        }

        try {
            await trpc.friends.acceptFriendRequest.mutate({
                requesterId,
                addresseeId: currentUserId,
            });
            openSnackbar('success', 'Friend request accepted.');
            await loadFriendsData();
        } catch (error) {
            console.error('Error accepting friend request:', error);
            openSnackbar('error', 'Failed to accept friend request.');
        }
    };

    const handleDecline = async (requesterId: string) => {
        if (!currentUserId) {
            return;
        }

        try {
            await trpc.friends.removeFriend.mutate({
                userId: currentUserId,
                friendId: requesterId,
            });
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

    const handleCloseBlockMenu = () => {
        setBlockMenuAnchor(null);
    };

    const handleBlockClick = () => {
        if (blockMenuAnchor) {
            setUserToBlock(blockMenuAnchor.requestId);
            setBlockDialogOpen(true);
            handleCloseBlockMenu();
        }
    };

    const handleConfirmBlock = async () => {
        if (!currentUserId || !userToBlock) {
            return;
        }

        try {
            await trpc.friends.blockUser.mutate({
                userId: currentUserId,
                blockId: userToBlock,
            });
            openSnackbar('info', 'User blocked.');
            setUserToBlock(null);
            setBlockDialogOpen(false);
            await loadFriendsData();
        } catch (error) {
            console.error('Error blocking user:', error);
            openSnackbar('error', 'Failed to block user.');
        }
    };

    const handleCancelBlock = () => {
        setUserToBlock(null);
        setBlockDialogOpen(false);
    };

    const handleViewSchedule = (friend: Friend) => {
        navigate('/share/friend/' + encodeURIComponent(friend.id), {
            state: { friendName: friend.name ?? friend.email },
        });
    };

    const handleOpenFriendMenu = (event: React.MouseEvent<HTMLElement>, friendId: string) => {
        setFriendMenuAnchor({ element: event.currentTarget, friendId });
    };

    const handleCloseFriendMenu = () => {
        setFriendMenuAnchor(null);
    };

    const handleUnfriend = async () => {
        if (!currentUserId || !friendMenuAnchor) {
            return;
        }

        try {
            await trpc.friends.removeFriend.mutate({
                userId: currentUserId,
                friendId: friendMenuAnchor.friendId,
            });
            openSnackbar('info', 'Friend removed.');
            setFriendMenuAnchor(null);
            await loadFriendsData();
        } catch (error) {
            console.error('Error removing friend:', error);
            openSnackbar('error', 'Failed to remove friend.');
        }
    };

    const handleChangeTab = (_: React.SyntheticEvent, value: 'requests' | 'friends' | 'blocked') => {
        setActiveTab(value);
    };

    const handleUnblock = async (blockedId: string) => {
        if (!currentUserId) {
            return;
        }

        try {
            await trpc.friends.unblockUser.mutate({
                userId: currentUserId,
                blockId: blockedId,
            });
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
            <Box>
                {/* Section 1: Add Friends */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            mb: 1,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Add Friends
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    if (email.trim()) void handleAddFriend();
                                }
                            }}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '1rem',
                                },
                            }}
                        />
                        <IconButton
                            onClick={handleAddFriend}
                            disabled={!email.trim()}
                            color="primary"
                            sx={{
                                bgcolor: isDark ? 'primary.dark' : 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: isDark ? 'primary.main' : 'primary.dark',
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'action.disabledBackground',
                                    color: 'action.disabled',
                                },
                            }}
                        >
                            <PersonAdd />
                        </IconButton>
                    </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                <Tabs
                    value={activeTab}
                    onChange={handleChangeTab}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ mb: 1 }}
                >
                    <Tab
                        label={
                            hasPendingRequests ? (
                                <Box>
                                    <Typography component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                                        Requests {friendRequests.length > 0 && `(${friendRequests.length})`}
                                    </Typography>
                                </Box>
                            ) : (
                                'Requests'
                            )
                        }
                        value="requests"
                    />
                    <Tab label="Friends" value="friends" />
                    <Tab label="Blocked" value="blocked" />
                </Tabs>

                {activeTab === 'requests' && (
                    <Box sx={{ mb: 2, mt: 1 }}>
                        {friendRequests.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '1rem' }}>
                                No pending requests
                            </Typography>
                        ) : (
                            friendRequests.map((request) => (
                                <Box
                                    key={request.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: 'text.secondary',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" flex={1} overflow="hidden">
                                        <Box sx={{ minWidth: 0, ml: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                {request.name || request.email}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                {request.email}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleAccept(request.id)}
                                            sx={{
                                                bgcolor: '#4caf50',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                minWidth: 'auto',
                                                px: 1.5,
                                                py: 0.5,
                                                boxShadow: 1,
                                                '&:hover': {
                                                    bgcolor: '#388e3c',
                                                    boxShadow: 2,
                                                },
                                            }}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleDecline(request.id)}
                                            sx={{
                                                bgcolor: '#ef5350',
                                                color: 'white',
                                                fontSize: '0.8rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                minWidth: 'auto',
                                                px: 1.5,
                                                py: 0.5,
                                                boxShadow: 1,
                                                '&:hover': {
                                                    bgcolor: '#d32f2f',
                                                    boxShadow: 2,
                                                },
                                            }}
                                        >
                                            Reject
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleOpenBlockMenu(e, request.id)}
                                            sx={{
                                                color: 'text.secondary',
                                                ml: 0.5,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                    color: 'text.primary',
                                                },
                                            }}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))
                        )}
                    </Box>
                )}

                {activeTab === 'friends' && (
                    <Box sx={{ mt: 1 }}>
                        {friends.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '1rem' }}>
                                No friends yet
                            </Typography>
                        ) : (
                            friends.map((friend) => (
                                <Box
                                    key={friend.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: 'text.secondary',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" flex={1} overflow="hidden">
                                        <Box sx={{ minWidth: 0, ml: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                {friend.name || friend.email}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                {friend.email}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={0.5} alignItems="center">
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleViewSchedule(friend)}
                                            sx={{
                                                fontSize: '1rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                py: 0.5,
                                                px: 1.5,
                                                boxShadow: 2,
                                                ml: 1,
                                                whiteSpace: 'nowrap',
                                                '&:hover': {
                                                    boxShadow: 3,
                                                },
                                            }}
                                        >
                                            View Schedule
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleOpenFriendMenu(e, friend.id)}
                                            sx={{
                                                color: 'text.secondary',
                                                ml: 0.5,
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                    color: 'text.primary',
                                                },
                                            }}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))
                        )}
                    </Box>
                )}

                {activeTab === 'blocked' && (
                    <Box sx={{ mt: 1 }}>
                        {blockedFriends.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '1rem' }}>
                                No blocked users
                            </Typography>
                        ) : (
                            blockedFriends.map((user) => (
                                <Box
                                    key={user.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        p: 1.5,
                                        mb: 1,
                                        borderRadius: 2,
                                        bgcolor: 'background.paper',
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        boxShadow: 'none',
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                            borderColor: 'text.secondary',
                                        },
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" flex={1} overflow="hidden">
                                        <Box sx={{ minWidth: 0, ml: 0.5 }}>
                                            <Typography variant="body2" fontWeight={600} noWrap>
                                                {user.name || user.email}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" noWrap display="block">
                                                {user.email}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleUnblock(user.id)}
                                        sx={{
                                            bgcolor: '#4caf50',
                                            color: 'white',
                                            fontSize: '0.8rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            minWidth: 'auto',
                                            px: 1.5,
                                            py: 0.5,
                                            boxShadow: 1,
                                            '&:hover': {
                                                bgcolor: '#388e3c',
                                                boxShadow: 2,
                                            },
                                        }}
                                    >
                                        Unblock
                                    </Button>
                                </Box>
                            ))
                        )}
                    </Box>
                )}
            </Box>

            {/* Block Menu */}
            <Menu
                anchorEl={blockMenuAnchor?.element}
                open={Boolean(blockMenuAnchor)}
                onClose={handleCloseBlockMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleBlockClick} sx={{ color: 'error.main' }}>
                    <Block sx={{ mr: 1, fontSize: '1.25rem' }} />
                    Block User
                </MenuItem>
            </Menu>

            {/* Friend Menu */}
            <Menu
                anchorEl={friendMenuAnchor?.element}
                open={Boolean(friendMenuAnchor)}
                onClose={handleCloseFriendMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleUnfriend} sx={{ color: 'error.main' }}>
                    Unfriend
                </MenuItem>
            </Menu>

            {/* Block Confirmation Dialog */}
            <Dialog open={blockDialogOpen} onClose={handleCancelBlock}>
                <DialogTitle>Block User?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to block this user? They will no longer be able to send you friend
                        requests.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelBlock} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmBlock} color="error" variant="contained">
                        Block
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
