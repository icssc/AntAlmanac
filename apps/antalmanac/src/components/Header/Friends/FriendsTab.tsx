import { Box, Paper, Popper, TextField, Typography } from '@mui/material';

import { FriendCard } from './FriendCard';
import { textFieldSx } from './styles';
import type { Friend } from './types';

interface FriendsTabProps {
    friends: Friend[];
    searchRef: React.RefObject<HTMLDivElement | null>;
    friendSearch: string;
    onSearchChange: (v: string) => void;
    dropdownOpen: boolean;
    onDropdownOpen: () => void;
    onDropdownClose: () => void;
    onView: (friend: Friend) => void;
    onOpenMenu: (e: React.MouseEvent<HTMLElement>, friendId: string) => void;
}

export function FriendsTab({
    friends,
    searchRef,
    friendSearch,
    onSearchChange,
    dropdownOpen,
    onDropdownOpen,
    onDropdownClose,
    onView,
    onOpenMenu,
}: FriendsTabProps) {
    const filtered = friends.filter(
        (f) =>
            (f.name?.toLowerCase() ?? '').includes(friendSearch.toLowerCase()) ||
            f.email.toLowerCase().includes(friendSearch.toLowerCase())
    );

    return (
        <Box sx={{ mt: 1 }}>
            <Box ref={searchRef}>
                <TextField
                    variant="standard"
                    size="small"
                    placeholder="Search friend by name or email"
                    value={friendSearch}
                    onChange={(e) => {
                        onSearchChange(e.target.value);
                        onDropdownOpen();
                    }}
                    onFocus={() => {
                        if (friendSearch.trim()) onDropdownOpen();
                    }}
                    onBlur={() => setTimeout(onDropdownClose, 150)}
                    fullWidth
                    sx={{ mb: 0.5, ...textFieldSx }}
                />
            </Box>

            <Popper
                open={dropdownOpen && Boolean(friendSearch.trim())}
                anchorEl={searchRef.current}
                placement="bottom-start"
                style={{ width: searchRef.current?.offsetWidth, zIndex: 9999 }}
            >
                <Paper
                    elevation={8}
                    sx={{
                        mt: 0.5,
                        maxHeight: 280,
                        overflowY: 'auto',
                        borderRadius: 2,
                        p: 1,
                        '&::-webkit-scrollbar': { width: 6 },
                        '&::-webkit-scrollbar-track': { background: 'none' },
                        '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'action.disabled' },
                    }}
                >
                    {filtered.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ py: 1, px: 0.5, fontSize: '0.9rem' }}>
                            No friends found
                        </Typography>
                    ) : (
                        filtered.map((friend) => (
                            <FriendCard
                                key={friend.id}
                                friend={friend}
                                onView={onView}
                                onOpenMenu={onOpenMenu}
                                preventBlur
                            />
                        ))
                    )}
                </Paper>
            </Popper>

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
                        <FriendCard key={friend.id} friend={friend} onView={onView} onOpenMenu={onOpenMenu} />
                    ))
                )}
            </Box>
        </Box>
    );
}
