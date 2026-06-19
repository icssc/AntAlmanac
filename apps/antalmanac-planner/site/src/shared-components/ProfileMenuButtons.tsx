import { FC, useState } from 'react';

import { Button, IconButton } from '@mui/material';
import Image from 'next/image';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MenuIcon from '@mui/icons-material/Menu';
import type { UserMetadata } from '@peterportal/types';
import SignInDialog from './SignInDialog';

interface ProfileMenuButtonsProps {
  user: UserMetadata | null;
  handleOpen: (event: React.MouseEvent<HTMLElement>) => void;
}
const ProfileMenuButtons: FC<ProfileMenuButtonsProps> = ({ user, handleOpen }) => {
  const [signInOpen, setSignInOpen] = useState(false);

  if (!user) {
    return (
      <>
        <Button
          className="header-button"
          variant="text"
          size="medium"
          color="inherit"
          startIcon={<AccountCircle />}
          onClick={() => setSignInOpen(true)}
        >
          Sign In
        </Button>
        <IconButton onClick={handleOpen} color="inherit">
          <MenuIcon />
        </IconButton>
        <SignInDialog open={signInOpen} onClose={() => setSignInOpen(false)} />
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
