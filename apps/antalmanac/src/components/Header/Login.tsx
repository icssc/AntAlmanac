import { useState, useRef } from 'react';
import {
    Avatar,
    Box,
    Button,
    Divider,
    Fade,
    FormGroup,
    FormLabel,
    IconButton,
    Paper,
    Popper,
    Stack,
    TextField,
} from '@mui/material';
import { CredentialResponse, GoogleLogin } from '@react-oauth/google';
import { useCallback } from 'react';
import { useSnackbar } from 'notistack';
import { useAuthStore } from '$stores/auth';

export function Login() {
    const { enqueueSnackbar } = useSnackbar();

    const ref = useRef();

    const [open, setOpen] = useState(false);

    const [username, setUsername] = useState('');

    const { user, setCodeUser, setGoogleUser, logout } = useAuthStore();

    const handleClick = useCallback(() => {
        setOpen((previousOpen) => !previousOpen);
    }, []);

    const onSuccess = useCallback(
        (credentialResponse: CredentialResponse) => {
            setGoogleUser(credentialResponse);
            enqueueSnackbar('Login Success', { variant: 'success' });
            setOpen(false);
        },
        [setGoogleUser]
    );

    const onError = useCallback(() => {
        enqueueSnackbar('Login Failed', { variant: 'error' });
        setOpen(false);
    }, []);

    const handleLogout = useCallback(() => {
        logout();
        enqueueSnackbar('Logout Success', { variant: 'success' });
        setOpen(false);
    }, [logout]);

    const handleChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(event.target.value);
    }, []);

    const handleSubmit = useCallback(() => {
        setCodeUser(username);
        enqueueSnackbar('Login Success', { variant: 'success' });
        setOpen(false);
    }, [username]);

    return (
        <Box>
            <Box ref={ref}>
                {user?.email ? (
                    <IconButton onClick={handleClick} sx={{ p: 0 }}>
                        <Avatar alt={user.name} src={user.picture} />
                    </IconButton>
                ) : (
                    <Button onClick={handleClick} variant="outlined" color="inherit">
                        LOG IN
                    </Button>
                )}

                <Popper open={open} anchorEl={ref.current} placement="bottom-end" transition>
                    {({ TransitionProps }) => (
                        <Fade {...TransitionProps} timeout={350}>
                            <Paper sx={{ p: 4 }}>
                                {user?.email != null ? (
                                    <Button onClick={handleLogout} variant="outlined" color="inherit">
                                        LOG OUT
                                    </Button>
                                ) : (
                                    <Stack gap={2}>
                                        <GoogleLogin onSuccess={onSuccess} onError={onError} />

                                        <Divider>OR</Divider>

                                        <FormGroup sx={{ gap: 1 }}>
                                            <FormLabel>Log in with legacy username</FormLabel>
                                            <TextField value={username} onChange={handleChange} size="small" />
                                            <Button variant="outlined" color="inherit" onClick={handleSubmit}>
                                                Submit
                                            </Button>
                                        </FormGroup>
                                    </Stack>
                                )}
                            </Paper>
                        </Fade>
                    )}
                </Popper>
            </Box>
        </Box>
    );
}
