import { Box, Button } from '@mui/material';

import { FriendIdentity } from './FriendIdentity';
import { friendCardSx } from './styles';
import type { FriendRequest } from './types';

interface SentRequestCardProps {
    request: FriendRequest;
    onCancel: (id: string) => void;
}

export function SentRequestCard({ request, onCancel }: SentRequestCardProps) {
    return (
        <Box sx={friendCardSx}>
            <FriendIdentity name={request.name} email={request.email} avatar={request.avatar} />
            <Button
                size="small"
                variant="outlined"
                onClick={() => onCancel(request.id)}
                sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    borderColor: 'error.main',
                    color: 'error.main',
                    '&:hover': { bgcolor: 'error.main', color: 'white', borderColor: 'error.main' },
                }}
            >
                Cancel
            </Button>
        </Box>
    );
}
