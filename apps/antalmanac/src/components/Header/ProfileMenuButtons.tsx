import { FC } from 'react';

import { Button, IconButton } from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import { User } from '@packages/antalmanac-types';

interface ProfileMenuButtonsProps {
    user: User | null;
    handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
    handleSettingsOpen: (event: React.MouseEvent<HTMLElement>) => void;
}
export const ProfileMenuButtons: FC<ProfileMenuButtonsProps> = ({ user, handleOpen, handleSettingsOpen }) => {
      if (!user) {
        return (
            <>
                <Button
                    variant="text"
                    size="medium"
                    startIcon={<AccountCircleIcon />}
                    color="inherit"
                    onClick={handleOpen}  
                >
                    Sign In
                </Button>
                <IconButton onClick={handleSettingsOpen} color="inherit">
                    <MenuIcon />
                </IconButton>
            </>
        );
    }

    const { name, avatar } = user;

    const profileButtonStyles = {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        padding: '6px 8px',
        borderRadius: 24,
        border: 'none',
    };

    const profilePicStyles = {
        width: 24,
        height: 24,
        borderRadius: '100%',
        color: 'inherit',
        whiteSpace: 'normal',
    };

    return (
        <Button sx={profileButtonStyles} onClick={handleOpen} variant="text" color="inherit">
            {avatar ? (
                <Image src={avatar} alt={name ?? 'User avatar'} width={24} height={24} style={profilePicStyles} />
            ) : (
                <AccountCircleIcon sx={{ width: 24, height: 24 }} />
            )}
            <MenuIcon />
        </Button>
    );
};

