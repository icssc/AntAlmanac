import { AccountCircle } from '@mui/icons-material';
import { Stack, Typography } from '@mui/material';
import Image from 'next/image';

interface FriendAvatarProps {
    name: string | null;
    email: string | null;
    avatar: string | null;
    size?: 'default' | 'compact';
}

export function FriendAvatar({ name, email, avatar, size = 'default' }: FriendAvatarProps) {
    const displayEmail = email ?? '';
    const isCompact = size === 'compact';
    const avatarSize = isCompact ? 28 : 36;

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
            {avatar ? (
                <Image
                    src={avatar}
                    alt={name ?? displayEmail ?? 'Friend avatar'}
                    width={avatarSize}
                    height={avatarSize}
                    style={{
                        width: avatarSize,
                        height: avatarSize,
                        borderRadius: '100%',
                        objectFit: 'cover',
                        flexShrink: 0,
                    }}
                />
            ) : (
                <AccountCircle sx={{ fontSize: avatarSize, flexShrink: 0 }} />
            )}

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
