import { AccountCircle } from '@mui/icons-material';
import { Avatar, Stack, Typography } from '@mui/material';

interface FriendAvatarProps {
    name: string | null;
    email: string | null;
    avatar: string | null;
}

export function FriendAvatar({ name, email, avatar }: FriendAvatarProps) {
    const displayEmail = email ?? '';

    return (
        <Stack sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1, flex: 1 }}>
            <Avatar src={avatar || undefined} sx={{ width: 30, height: 30 }}>
                <AccountCircle />
            </Avatar>

            <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                    {name || displayEmail}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                >
                    {displayEmail}
                </Typography>
            </Stack>
        </Stack>
    );
}
