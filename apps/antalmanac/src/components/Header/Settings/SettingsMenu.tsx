import { AccountCircle } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { User } from '@packages/antalmanac-types';
import Image from 'next/image';

import { About } from '$components/Header/About';
import { ExperimentalMenu } from '$components/Header/Settings/ExperimentalMenu';
import { ThemeSelector } from '$components/Header/Settings/ThemeSelector';
import { TimeSelector } from '$components/Header/Settings/TimeSelector';

interface UserProfileSectionProps {
    user: Pick<User, 'name' | 'avatar' | 'email'> | null;
}

function UserProfileSection({ user }: UserProfileSectionProps) {
    const theme = useTheme();

    if (!user) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {user.avatar ? (
                <Image
                    src={user.avatar}
                    alt={user.name ?? 'User'}
                    width={50}
                    height={50}
                    style={{ borderRadius: '50%', objectFit: 'cover' }}
                />
            ) : (
                <AccountCircle sx={{ width: 50, height: 50 }} />
            )}
            <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                    style={{
                        fontSize: '18px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        fontWeight: 'bold',
                        paddingBottom: '8px',
                        margin: 0,
                        lineHeight: 1,
                    }}
                >
                    {user.name}
                </Typography>
                <Typography
                    style={{
                        fontSize: '14px',
                        color: theme.palette.mode === 'dark' ? '#96969b' : '#606166',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        paddingBottom: '4px',
                        margin: 0,
                        lineHeight: 1,
                        fontWeight: 600,
                    }}
                >
                    {user.email}
                </Typography>
            </Box>
        </Box>
    );
}

interface SettingsMenuProps {
    user: Pick<User, 'name' | 'avatar' | 'email'> | null;
}

export function SettingsMenu({ user }: SettingsMenuProps) {
    return (
        <Stack sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <UserProfileSection user={user} />

            <ThemeSelector />
            <TimeSelector />

            <Stack>
                <Divider>
                    <Typography variant="subtitle2">Experimental Features</Typography>
                </Divider>

                <ExperimentalMenu />
                <Divider style={{ marginTop: '10px', marginBottom: '12px' }} />
                <About />
            </Stack>
        </Stack>
    );
}
