import { AccountCircle, Menu } from '@mui/icons-material';
import { Button, IconButton, CircularProgress } from '@mui/material';
import { User } from '@packages/antalmanac-types';
import Image from 'next/image';
import { useEffect, useState } from 'react';

import AppStore from '$stores/AppStore';

interface ProfileMenuButtonsProps {
    user: Pick<User, 'name' | 'avatar' | 'email'> | null;
    handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
    handleSettingsOpen: (event: React.MouseEvent<HTMLElement>) => void;
    loading?: boolean;
}

export function ProfileMenuButtons({ user, handleOpen, handleSettingsOpen, loading = false }: ProfileMenuButtonsProps) {
    const [skeletonMode, setSkeletonMode] = useState(AppStore.getSkeletonMode());

    useEffect(() => {
        const handleSkeletonModeChange = () => {
            setSkeletonMode(AppStore.getSkeletonMode());
        };

        AppStore.on('skeletonModeChange', handleSkeletonModeChange);

        return () => {
            AppStore.off('skeletonModeChange', handleSkeletonModeChange);
        };
    }, []);

    if (!user) {
        return (
            <>
                <Button
                    variant="text"
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AccountCircle />}
                    color="inherit"
                    onClick={handleOpen}
                    disabled={skeletonMode}
                    sx={{ fontSize: 'inherit' }}
                >
                    Sign In
                </Button>
                <IconButton onClick={handleSettingsOpen} color="inherit">
                    <Menu sx={{ width: 24, height: 24 }} />
                </IconButton>
            </>
        );
    }

    const { name, avatar } = user;

    return (
        <Button
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                padding: '6px 8px',
                borderRadius: 24,
                border: 'none',
            }}
            onClick={handleOpen}
            variant="text"
            color="inherit"
            disabled={skeletonMode}
        >
            {avatar ? (
                <Image
                    src={avatar}
                    alt={name ?? 'User avatar'}
                    width={24}
                    height={24}
                    style={{ width: 24, height: 24, borderRadius: '100%', color: 'inherit', whiteSpace: 'normal' }}
                />
            ) : (
                <AccountCircle sx={{ width: 24, height: 24 }} />
            )}
            <Menu sx={{ width: 24, height: 24 }} />
        </Button>
    );
}
