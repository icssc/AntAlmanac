import { FriendDropdownCard } from '$components/Header/Friends/FriendDropdownCard';
import type { Friend } from '$components/Header/Friends/types';
import { Paper, Popper, Typography } from '@mui/material';

interface FriendSearchDropdownProps {
    anchorEl: HTMLDivElement | null;
    open: boolean;
    friends: Friend[];
    query: string;
    onView: (friend: Friend) => void;
    onOpenMenu: (e: React.MouseEvent<HTMLElement>, friendId: string) => void;
}

export function FriendSearchDropdown({
    anchorEl,
    open,
    friends,
    query,
    onView,
    onOpenMenu,
}: FriendSearchDropdownProps) {
    const filtered = friends.filter(
        (f) =>
            (f.name?.toLowerCase() ?? '').includes(query.toLowerCase()) ||
            f.email.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <Popper
            open={open && Boolean(query.trim())}
            anchorEl={anchorEl}
            placement="bottom-start"
            style={{ width: anchorEl?.offsetWidth, zIndex: 9999 }}
        >
            <Paper
                elevation={8}
                onMouseDown={(e) => e.preventDefault()}
                sx={(theme) => ({
                    mt: -0.5,
                    maxHeight: 280,
                    overflowY: 'auto',
                    borderRadius: '0 0 8px 8px',
                    p: 1,
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-track': { background: 'none' },
                    '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'action.disabled' },
                    bgcolor: theme.palette.mode === 'dark' ? '#424242' : theme.palette.background.paper,
                    boxShadow: '0px 4px 4px 0px rgba(0,0,0,0.25)',
                })}
            >
                {filtered.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 1, px: 0.5, fontSize: '0.9rem' }}>
                        No friends found
                    </Typography>
                ) : (
                    filtered.map((friend) => (
                        <FriendDropdownCard key={friend.id} friend={friend} onView={onView} onOpenMenu={onOpenMenu} />
                    ))
                )}
            </Paper>
        </Popper>
    );
}
