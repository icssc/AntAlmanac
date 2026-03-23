import { FC } from 'react';

import { Button, IconButton } from '@mui/material';

import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import Image from 'next/image';
import MenuIcon from '@mui/icons-material/Menu';
import { UserMetadata } from '@peterportal/types';

interface ProfileMenuButtonsProps {
  user: UserMetadata | null;
  handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
}
const ProfileMenuButtons: FC<ProfileMenuButtonsProps> = ({ user, handleOpen }) => {
  if (!user) {
    return (
      <>
        <Button
          className="header-button"
          variant="text"
          size="medium"
          startIcon={<AccountCircleIcon />}
          color="inherit"
          href="/planner/api/users/auth/google"
        >
          Sign In
        </Button>
        <IconButton onClick={handleOpen} color="inherit">
          <MenuIcon />
        </IconButton>
      </>
    );
  }

  const { name, picture } = user;

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
      <Image src={picture} alt={name} style={profilePicStyles} width={24} height={24} />
      <MenuIcon />
    </Button>
  );
};

export default ProfileMenuButtons;
