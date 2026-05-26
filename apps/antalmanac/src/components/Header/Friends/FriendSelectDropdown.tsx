import { FriendCard } from '$components/Header/Friends/Friends/FriendCard';
import { trpc } from '$lib/api/trpc';
import type { Friend } from '$src/backend/lib/rds.types';
import FriendsStore from '$stores/FriendsStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import { Box, Button, Popover, TextField, Typography } from '@mui/material';
import { useCallback, useEffect, useRef, useState } from 'react';

function getFriendDisplayName(friend: Pick<Friend, 'name' | 'email'>) {
    return friend.name ?? friend.email ?? 'Friend';
}

interface FriendSelectDropdownProps {
    currentFriendId: string | null;
    currentFriendName: string;
}

export function FriendSelectDropdown({ currentFriendId, currentFriendName }: FriendSelectDropdownProps) {
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);
    const userId = useSessionStore((store) => store.userId);

    const [friends, setFriends] = useState<Friend[]>([]);
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const anchorElementRef = useRef<HTMLButtonElement>(null);

    const loadFriends = useCallback(async () => {
        if (!sessionIsValid || !userId) {
            setFriends([]);
            return;
        }

        const result = await trpc.friends.getFriends.query();
        setFriends(result);
    }, [sessionIsValid, userId]);

    useEffect(() => {
        void loadFriends();
    }, [loadFriends]);

    const handleClick = useCallback(() => {
        setOpen(true);
    }, []);

    const handleClose = useCallback(() => {
        setOpen(false);
        setQuery('');
    }, []);

    const handleFriendChange = useCallback(
        async (friend: Friend) => {
            if (friend.id === currentFriendId) {
                handleClose();
                return;
            }

            handleClose();

            const friendName = getFriendDisplayName(friend);
            const success = await FriendsStore.openFriendView(friend.id, friendName);

            if (!success) {
                openSnackbar('warning', "This friend hasn't shared any schedules with you.");
            }
        },
        [currentFriendId, handleClose]
    );

    const normalizedQuery = query.toLowerCase().trim();

    const filteredFriends = friends.filter(
        (friend) =>
            (friend.name?.toLowerCase() ?? '').includes(normalizedQuery) ||
            (friend.email?.toLowerCase() ?? '').includes(normalizedQuery)
    );

    return (
        <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', mx: 0.75 }}>
            <Button
                ref={anchorElementRef}
                size="small"
                color="inherit"
                variant="outlined"
                onClick={handleClick}
                sx={{
                    minWidth: 100,
                    maxWidth: 180,
                    justifyContent: 'space-between',
                }}
            >
                <Typography whiteSpace="nowrap" textOverflow="ellipsis" overflow="hidden" textTransform="none">
                    {currentFriendName}
                </Typography>
                <ArrowDropDownIcon />
            </Button>

            <Popover
                open={open}
                anchorEl={anchorElementRef.current}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                slotProps={{
                    paper: {
                        sx: {
                            width: 360,
                            mt: 0.5,
                        },
                    },
                }}
            >
                <Box sx={{ px: 2, pt: 2, pb: 2.5 }}>
                    <TextField
                        variant="standard"
                        placeholder="Search friend by name or email"
                        autoComplete="off"
                        fullWidth
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        sx={{
                            '& .MuiInput-root': {
                                fontSize: '0.9375rem',
                                '&:before': {
                                    borderBottomColor: 'divider',
                                },
                                '&:hover:not(.Mui-disabled):before': {
                                    borderBottomColor: 'text.secondary',
                                },
                            },
                            '& .MuiInput-input': {
                                py: 1.25,
                                px: 0,
                            },
                            '& .MuiInput-input::placeholder': {
                                color: 'text.secondary',
                                opacity: 1,
                            },
                        }}
                    />

                    <Box
                        sx={{
                            mt: 2.5,
                            maxHeight: 360,
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 0.5,
                        }}
                    >
                        {filteredFriends.length === 0 ? (
                            <Typography variant="body2" color="text.secondary">
                                No friends found
                            </Typography>
                        ) : (
                            filteredFriends.map((friend) => (
                                <FriendCard
                                    key={friend.id}
                                    friend={friend}
                                    variant="compact"
                                    onView={handleFriendChange}
                                    onRefresh={loadFriends}
                                />
                            ))
                        )}
                    </Box>
                </Box>
            </Popover>
        </Box>
    );
}
