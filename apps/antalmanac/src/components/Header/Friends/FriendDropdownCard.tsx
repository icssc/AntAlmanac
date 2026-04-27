import { MoreVert } from '@mui/icons-material';
import { Box, Button, IconButton, Stack } from '@mui/material';

import { FriendIdentity } from './FriendIdentity';
import type { Friend } from './types';

interface FriendDropdownCardProps {
    friend: Friend;
    onView: (friend: Friend) => void;
    onOpenMenu: (e: React.MouseEvent<HTMLElement>, friendId: string) => void;
}

export function FriendDropdownCard({ friend, onView, onOpenMenu }: FriendDropdownCardProps) {
    return (
        <Box
            sx={(theme) => ({
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 1,
                py: 0.75,
                borderRadius: 1,
                bgcolor: theme.palette.mode === 'dark' ? '#424242' : theme.palette.grey[100],
                '&:hover': { bgcolor: 'action.hover' },
                transition: 'background-color 0.15s ease',
            })}
        >
            <FriendIdentity name={friend.name} email={friend.email} avatar={friend.avatar} />
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Button
                    size="small"
                    variant="contained"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => onView(friend)}
                    sx={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        py: 0.5,
                        px: 1.5,
                        boxShadow: 2,
                        ml: 1,
                        whiteSpace: 'nowrap',
                        '&:hover': { boxShadow: 3 },
                    }}
                >
                    View
                </Button>
                <IconButton
                    size="small"
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={(e) => onOpenMenu(e, friend.id)}
                    sx={{
                        color: 'text.secondary',
                        ml: 0.5,
                        '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                    }}
                >
                    <MoreVert fontSize="small" />
                </IconButton>
            </Stack>
        </Box>
    );
}
