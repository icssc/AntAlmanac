import { PersonAdd, ExpandMore, ExpandLess } from '@mui/icons-material';
import { Box, Button, Collapse, IconButton, Stack, TextField, Typography } from '@mui/material';

import { BlockedUserCard } from './BlockedUserCard';
import { RequestCard } from './RequestCard';
import { textFieldSx } from './styles';
import type { Friend, FriendRequest } from './types';

interface RequestsTabProps {
    email: string;
    onEmailChange: (v: string) => void;
    onAddFriend: () => void;
    isDark: boolean;
    friendRequests: FriendRequest[];
    blockedFriends: Friend[];
    blockedOpen: boolean;
    onToggleBlocked: () => void;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    onOpenBlockMenu: (e: React.MouseEvent<HTMLElement>, id: string) => void;
    onUnblock: (id: string) => void;
}

export function RequestsTab({
    email,
    onEmailChange,
    onAddFriend,
    isDark,
    friendRequests,
    blockedFriends,
    blockedOpen,
    onToggleBlocked,
    onAccept,
    onDecline,
    onOpenBlockMenu,
    onUnblock,
}: RequestsTabProps) {
    return (
        <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                <TextField
                    variant="standard"
                    size="small"
                    placeholder="Search friend by name or email"
                    value={email}
                    onChange={(e) => onEmailChange(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (email.trim()) onAddFriend();
                        }
                    }}
                    fullWidth
                    sx={textFieldSx}
                />
                <IconButton
                    onClick={onAddFriend}
                    disabled={!email.trim()}
                    color="primary"
                    sx={{
                        bgcolor: isDark ? 'primary.dark' : 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: isDark ? 'primary.main' : 'primary.dark' },
                        '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                    }}
                >
                    <PersonAdd />
                </IconButton>
            </Stack>

            <Box sx={{ mb: 2, mt: 1 }}>
                {friendRequests.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" sx={{ py: 2, pl: 0.5, fontSize: '1rem' }}>
                        No pending requests
                    </Typography>
                ) : (
                    friendRequests.map((request) => (
                        <RequestCard
                            key={request.id}
                            request={request}
                            onAccept={onAccept}
                            onDecline={onDecline}
                            onOpenBlockMenu={onOpenBlockMenu}
                        />
                    ))
                )}

                <Box>
                    <Button
                        variant="text"
                        size="small"
                        onClick={onToggleBlocked}
                        endIcon={blockedOpen ? <ExpandLess /> : <ExpandMore />}
                        sx={{ color: 'text.secondary', textTransform: 'none', fontSize: '0.8rem', px: 0.5 }}
                    >
                        Blocked{blockedFriends.length > 0 ? ` (${blockedFriends.length})` : ''}
                    </Button>
                    <Collapse in={blockedOpen}>
                        <Box sx={{ mt: 1 }}>
                            {blockedFriends.length === 0 ? (
                                <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '0.875rem' }}>
                                    No blocked users
                                </Typography>
                            ) : (
                                blockedFriends.map((user) => (
                                    <BlockedUserCard key={user.id} user={user} onUnblock={onUnblock} />
                                ))
                            )}
                        </Box>
                    </Collapse>
                </Box>
            </Box>
        </>
    );
}
