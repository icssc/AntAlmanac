import { AccountCircle } from '@mui/icons-material';
import { Avatar, Stack, Typography } from '@mui/material';

interface FriendAvatarProps {
    name: string | null;
    email: string | null;
    avatar: string | null;
    size?: 'default' | 'compact';
}

export function FriendAvatar({ name, email, avatar, size = 'default' }: FriendAvatarProps) {
    const displayEmail = email ?? '';
    const isCompact = size === 'compact';

    return (
        <Stack
            sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                gap: isCompact ? 1 : 1.5,
                flex: 1,
                minWidth: 0,
            }}
        >
            <Avatar src={avatar || undefined} sx={{ width: isCompact ? 28 : 36, height: isCompact ? 28 : 36 }}>
                <AccountCircle sx={{ fontSize: isCompact ? 28 : 36 }} />
            </Avatar>

            <Stack sx={{ display: 'flex', flexDirection: 'column', gap: isCompact ? 0 : 0.25, minWidth: 0 }}>
                <Typography
                    variant={isCompact ? 'caption' : 'body2'}
                    fontWeight={600}
                    sx={{
                        fontSize: isCompact ? '0.8125rem' : undefined,
                        lineHeight: isCompact ? 1.3 : undefined,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {name || displayEmail}
                </Typography>
                <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{
                        fontSize: isCompact ? '0.6875rem' : undefined,
                        lineHeight: isCompact ? 1.3 : undefined,
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {displayEmail}
                </Typography>
            </Stack>
        </Stack>
    );
}
