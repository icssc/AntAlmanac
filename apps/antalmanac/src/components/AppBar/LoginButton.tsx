import { useState, MouseEvent, useEffect } from 'react';
import { AssignmentReturn, AssignmentReturned } from '@mui/icons-material';
import { Button, Avatar, Box, MenuItem, MenuList, Popover } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Typography } from '@material-ui/core';
import { LOGIN_ENDPOINT, LOGOUT_ENDPOINT } from '$lib/api/endpoints';
import AppStore, { User } from '$stores/AppStore';

const StyledButton = styled(Button)({
    display: 'flex',
    alignItems: 'center',
});

const StyledAvatar = styled(Avatar)({
    width: 30,
    height: 30,
});

const StyledBox = styled(Box)({
    fontSize: '0.9rem',
    fontWeight: 500,
    marginRight: 5,
});

const login = () => {
    window.location.href = LOGIN_ENDPOINT;
};

const logout = () => {
    fetch(LOGOUT_ENDPOINT, {
        method: 'POST',
        credentials: 'include',
    });
    // force page reload
    window.location.reload();
};

const LoginButton = () => {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [authUser, setAuthUser] = useState<User | undefined>(undefined);

    const handleClick = (event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    useEffect(() => {
        const updateAuthUser = async () => {
            const user = AppStore.user;
            setAuthUser(user);
        };
        updateAuthUser();
        AppStore.on('userAuthenticated', updateAuthUser);
    });

    return (
        <>
            {authUser !== undefined ? (
                <>
                    <StyledButton onClick={handleClick} color="inherit">
                        <StyledAvatar
                            alt={authUser.name}
                            src={authUser.picture}
                            imgProps={{ referrerPolicy: 'no-referrer' }}
                        />
                    </StyledButton>

                    <Popover
                        anchorEl={anchorEl}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
                        keepMounted
                        open={Boolean(anchorEl)}
                        onClose={handleClose}
                    >
                        <MenuList>
                            <MenuItem style={{ pointerEvents: 'none' }}>
                                <Box display="flex" justifyContent="center" width="100%">
                                    <Typography variant="button" align="center">
                                        {authUser.name}
                                    </Typography>
                                </Box>
                            </MenuItem>
                            <MenuItem>
                                <Button onClick={logout} color="inherit" startIcon={<AssignmentReturn />}>
                                    Logout
                                </Button>
                            </MenuItem>
                        </MenuList>
                    </Popover>
                </>
            ) : (
                <Button onClick={login} color="inherit" startIcon={<AssignmentReturned />}>
                    Login
                </Button>
            )}
        </>
    );
};
export default LoginButton;
