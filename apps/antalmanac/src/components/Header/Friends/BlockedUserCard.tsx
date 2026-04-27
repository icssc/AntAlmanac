import { Box, Button, Stack, Typography } from '@mui/material';

import { friendCardSx } from './styles';
import type { Friend } from './types';

interface BlockedUserCardProps {
    user: Friend;
    onUnblock: (id: string) => void;
}

export function BlockedUserCard({ user, onUnblock }: BlockedUserCardProps) {
    return (
        <Box sx={friendCardSx}>
            <Stack direction="row" alignItems="center" flex={1} overflow="hidden">
                <Box sx={{ minWidth: 0, ml: 0.5 }}>
                    <Typography variant="body2" fontWeight={600} noWrap>
                        {user.name || user.email}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" noWrap display="block">
                        {user.email}
                    </Typography>
                </Box>
            </Stack>
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
