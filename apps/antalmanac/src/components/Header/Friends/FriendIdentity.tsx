import { AccountCircle } from '@mui/icons-material';
import { Avatar, Box, Stack, Typography } from '@mui/material';

interface FriendIdentityProps {
    name?: string;
    email: string;
    avatar?: string;
    avatarSize?: number;
}

export function FriendIdentity({ name, email, avatar, avatarSize = 30 }: FriendIdentityProps) {
    return (
        <Stack direction="row" alignItems="center" spacing={1.5} flex={1} overflow="hidden">
            <Avatar src={avatar ?? undefined} sx={{ bgcolor: 'grey.700', width: avatarSize, height: avatarSize }}>
                {!avatar && <AccountCircle sx={{ fontSize: avatarSize * 0.67 }} />}
            </Avatar>
            <Box sx={{ minWidth: 0, userSelect: 'none', cursor: 'default' }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                    {name || email}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap display="block">
                    {email}
                </Typography>
            </Box>
        </Stack>
    );
}
