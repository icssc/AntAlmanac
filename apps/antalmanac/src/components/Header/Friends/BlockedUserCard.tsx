import { Box, Button } from '@mui/material';

import { FriendIdentity } from './FriendIdentity';
import { friendCardSx } from './styles';
import type { Friend } from './types';

interface BlockedUserCardProps {
    user: Friend;
    onUnblock: (id: string) => void;
}

export function BlockedUserCard({ user, onUnblock }: BlockedUserCardProps) {
    return (
        <Box sx={friendCardSx}>
            <FriendIdentity name={user.name} email={user.email} avatar={user.avatar} />
            <Button
                size="small"
                variant="contained"
                onClick={() => onUnblock(user.id)}
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
                    '&:hover': { bgcolor: '#388e3c', boxShadow: 2 },
                }}
            >
                Unblock
            </Button>
        </Box>
    );
}
