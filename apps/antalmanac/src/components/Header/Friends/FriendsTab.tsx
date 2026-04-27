import { Box, TextField, Typography } from '@mui/material';

import { FriendCard } from './FriendCard';
import { FriendSearchDropdown } from './FriendSearchDropdown';
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
    return (
        <Box sx={{ mt: 1 }}>
            <Box ref={searchRef}>
                <TextField
                    variant="standard"
                    size="small"
                    placeholder="Search friend by name or email"
                    autoComplete="off"
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

            <FriendSearchDropdown
                anchorEl={searchRef.current}
                open={dropdownOpen}
                friends={friends}
                query={friendSearch}
                onView={onView}
                onOpenMenu={onOpenMenu}
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
                        <FriendCard key={friend.id} friend={friend} onView={onView} onOpenMenu={onOpenMenu} />
                    ))
                )}
            </Box>
        </Box>
    );
}
