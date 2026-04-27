import { MoreVert } from '@mui/icons-material';
import { Box, Button, IconButton, Stack } from '@mui/material';

import { FriendIdentity } from './FriendIdentity';
import { friendCardSx } from './styles';
import type { FriendRequest } from './types';

interface RequestCardProps {
    request: FriendRequest;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
    onOpenBlockMenu: (e: React.MouseEvent<HTMLElement>, id: string) => void;
}

export function RequestCard({ request, onAccept, onDecline, onOpenBlockMenu }: RequestCardProps) {
    return (
        <Box sx={friendCardSx}>
            <FriendIdentity name={request.name} email={request.email} avatar={request.avatar} />
            <Stack direction="row" spacing={0.5} alignItems="center">
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => onAccept(request.id)}
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
                    Accept
                </Button>
                <Button
                    size="small"
                    variant="contained"
                    onClick={() => onDecline(request.id)}
                    sx={{
                        bgcolor: '#ef5350',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: 'auto',
                        px: 1.5,
                        py: 0.5,
                        boxShadow: 1,
                        '&:hover': { bgcolor: '#d32f2f', boxShadow: 2 },
                    }}
                >
                    Reject
                </Button>
                <IconButton
                    size="small"
                    onClick={(e) => onOpenBlockMenu(e, request.id)}
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
