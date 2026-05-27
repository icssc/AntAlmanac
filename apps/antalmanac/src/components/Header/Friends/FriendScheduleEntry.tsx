import { SignInDialog } from '$components/dialogs/SignInDialog';
import { FriendAvatar } from '$components/Header/Friends/FriendAvatar';
import { trpc } from '$lib/api/trpc';
import type { Friend } from '$src/backend/lib/rds.types';
import { useIsMobile } from '$src/hooks/useIsMobile';
import FriendsStore from '$stores/FriendsStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { People } from '@mui/icons-material';
import { Box, Button, CircularProgress, IconButton, Popover, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

export function FriendScheduleEntry() {
    const userId = useSessionStore((store) => store.userId);
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);
    const isMobile = useIsMobile();

    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const open = Boolean(anchorEl);

    const loadFriends = useCallback(async () => {
        if (!sessionIsValid || !userId) {
            return;
        }

        setIsLoading(true);
        try {
            setFriends(await trpc.friends.getFriends.query());
        } catch (error) {
            console.error('Failed to load friends:', error);
            openSnackbar('error', 'Failed to load friends.');
        } finally {
            setIsLoading(false);
        }
    }, [sessionIsValid, userId]);

    useEffect(() => {
        if (open && sessionIsValid && userId) {
            void loadFriends();
        }
    }, [open, sessionIsValid, userId, loadFriends]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        if (sessionIsValid && userId) {
            setAnchorEl(event.currentTarget);
        } else {
            setOpenSignInDialog(true);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleViewSchedule = async (friend: Friend) => {
        handleClose();

        const friendName = friend.name ?? friend.email ?? 'Friend';
        const success = await FriendsStore.openFriendView(friend.id, friendName);

        if (!success) {
            openSnackbar('warning', "This friend hasn't shared any schedules with you.");
        }
    };

    return (
        <>
            {isMobile ? (
                <IconButton color="inherit" onClick={handleClick}>
                    <People />
                </IconButton>
            ) : (
                <Button
                    variant="text"
                    startIcon={<People />}
                    color="inherit"
                    onClick={handleClick}
                    sx={{ fontSize: 'inherit' }}
                >
                    Friends
                </Button>
            )}

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                slotProps={{ paper: { sx: { width: 320, p: 2 } } }}
            >
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
                    View a friend&apos;s schedule
                </Typography>

                {isLoading ? (
                    <Box display="flex" justifyContent="center" py={3}>
                        <CircularProgress size={24} />
                    </Box>
                ) : friends.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">
                        No friends added yet.
                    </Typography>
                ) : (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, maxHeight: 280, overflowY: 'auto' }}>
                        {friends.map((friend) => (
                            <Box
                                key={friend.id}
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1,
                                    p: 1,
                                    border: 1,
                                    borderColor: 'divider',
                                    borderRadius: 1,
                                }}
                            >
                                <FriendAvatar name={friend.name} email={friend.email} avatar={friend.avatar} />
                                <Button size="small" variant="outlined" onClick={() => handleViewSchedule(friend)}>
                                    View
                                </Button>
                            </Box>
                        ))}
                    </Box>
                )}
            </Popover>

            <SignInDialog open={openSignInDialog} feature="Friends" onClose={() => setOpenSignInDialog(false)} />
        </>
    );
}
