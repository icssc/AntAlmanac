import { PersonAdd, Block, MoreVert } from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { openSnackbar } from '$actions/AppStoreActions';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

interface FriendRequest {
    id: string;
    name?: string;
    email: string;
}

interface Friend {
    id: string;
    name?: string;
    email: string;
}

export function FriendsMenu() {
    const isDark = useThemeStore((store) => store.isDark);
    const session = useSessionStore((store) => store.session);
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [email, setEmail] = useState('');
    const [blockMenuAnchor, setBlockMenuAnchor] = useState<{ element: HTMLElement; requestId: string } | null>(null);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [userToBlock, setUserToBlock] = useState<string | null>(null);

    const loadFriendsData = useCallback(async () => {
        if (!sessionIsValid || !session) {
            setCurrentUserId(null);
            setFriendRequests([]);
            setFriends([]);
            return;
        }

        try {
            const { users } = await trpc.userData.getUserAndAccountBySessionToken.query({
                token: session,
            });

            const userId = users.id;
            setCurrentUserId(userId);

            const [friendsResult, pendingResult] = await Promise.all([
                trpc.friends.getFriends.query({ userId }),
                trpc.friends.getPendingRequests.query({ userId }),
            ]);

            setFriends(
                friendsResult.map((friend) => ({
                    id: friend.id,
                    name: friend.name ?? undefined,
                    email: friend.email ?? '',
                }))
            );

            setFriendRequests(
                pendingResult.map((request) => ({
                    id: request.id,
                    name: request.name ?? undefined,
                    email: request.email ?? '',
                }))
            );
        } catch (error) {
            console.error('Failed to load friends data:', error);
            openSnackbar('error', 'Failed to load friends data.');
        }
    }, [session, sessionIsValid]);

    useEffect(() => {
        void loadFriendsData();
    }, [loadFriendsData]);

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
            if (error instanceof Error) {
                openSnackbar('error', error.message);
            } else {
                openSnackbar('error', 'Failed to send friend request.');
            }
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

    const handleConfirmBlock = () => {
        if (userToBlock) {
            // TODO: Implement block logic
            console.log('Blocking user:', userToBlock);
            setUserToBlock(null);
            setBlockDialogOpen(false);
        }
    };

    const handleCancelBlock = () => {
        setUserToBlock(null);
        setBlockDialogOpen(false);
    };

    const handleViewSchedule = (friendId: string) => {
        // TODO: Implement view schedule logic
        console.log('Viewing schedule for:', friendId);
    };

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

                {/* Section 2: Requests */}
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
                        Requests
                    </Typography>
                    <Box sx={{ mt: 1 }}>
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
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Section 3: Friends */}
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            mb: 1,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Friends
                    </Typography>
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
                                            onClick={() => handleViewSchedule(friend.id)}
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
                </Box>
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
