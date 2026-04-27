import { MoreVert } from '@mui/icons-material';
import { Box, Button, IconButton, Stack } from '@mui/material';

import { FriendIdentity } from './FriendIdentity';
import { friendCardSx } from './styles';
import type { Friend } from './types';

interface FriendCardProps {
    friend: Friend;
    onView: (friend: Friend) => void;
    onOpenMenu: (e: React.MouseEvent<HTMLElement>, friendId: string) => void;
    preventBlur?: boolean;
}

export function FriendCard({ friend, onView, onOpenMenu, preventBlur }: FriendCardProps) {
    const md = preventBlur ? (e: React.MouseEvent) => e.preventDefault() : undefined;
    return (
        <Box sx={friendCardSx}>
            <FriendIdentity name={friend.name} email={friend.email} avatar={friend.avatar} />
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Button
                    size="small"
                    variant="contained"
                    onMouseDown={md}
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
                    onMouseDown={md}
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
