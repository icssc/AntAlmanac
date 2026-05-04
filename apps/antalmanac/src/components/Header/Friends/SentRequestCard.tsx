import { FriendIdentity } from '$components/Header/Friends/FriendIdentity';
import { friendCardSx } from '$components/Header/Friends/styles';
import type { FriendRequest } from '$components/Header/Friends/types';
import { Box, Button } from '@mui/material';

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
                variant="contained"
                onClick={() => onCancel(request.id)}
                sx={{
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    textTransform: 'none',
                    minWidth: 'auto',
                    px: 1.5,
                    py: 0.5,
                    bgcolor: '#EF5350',
                    color: 'white',
                    '&:hover': { bgcolor: '#d32f2f' },
                }}
            >
                Unrequest
            </Button>
        </Box>
    );
}
