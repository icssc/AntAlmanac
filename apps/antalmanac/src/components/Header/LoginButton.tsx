import {
    Box,
    Button,
    Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    FormControlLabel,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import { useState } from 'react';

/**
 * Opens dialog for logging in.
 */
export function LoginButton() {
    const [userId, setUserId] = useState('');
    const [rememberMe, setRememberMe] = useState(true);
    const [open, setOpen] = useState(false);

    const handleOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleUserIdChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setUserId(event.target.value);
    };

    const handleRememberMeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setRememberMe(event.target.checked);
    };

    const handleSubmit = async () => {
        console.log('Submitting: ', { userId, rememberMe });
    };

    return (
        <>
            <Button onClick={handleOpen} color="inherit">
                Login
            </Button>
            <Dialog onClose={handleClose} open={open}>
                <DialogTitle>Login</DialogTitle>

                <DialogContent>
                    <Stack gap={2}>
                        <Stack gap={2}>
                            <Typography variant="h6">Username</Typography>

                            <Stack>
                                <Box>
                                    <Typography>Enter your unique user ID here to login.</Typography>
                                    <Typography style={{ color: 'red' }}>
                                        Make sure the user ID is unique and secret, or someone else can overwrite your
                                        schedule.
                                    </Typography>
                                </Box>

                                <form onSubmit={handleSubmit}>
                                    <TextField
                                        // eslint-disable-next-line jsx-a11y/no-autofocus
                                        autoFocus
                                        margin="dense"
                                        label="Unique User ID"
                                        type="text"
                                        fullWidth
                                        placeholder="Enter here"
                                        value={userId}
                                        onChange={handleUserIdChange}
                                    />

                                    <FormControlLabel
                                        control={
                                            <Checkbox
                                                checked={rememberMe}
                                                onChange={handleRememberMeChange}
                                                color="primary"
                                            />
                                        }
                                        label="Remember Me (Uncheck on shared computers)"
                                    />

                                    <Box>
                                        <Button color="inherit" variant="outlined">
                                            Submit
                                        </Button>
                                    </Box>
                                </form>
                            </Stack>
                        </Stack>

                        <Divider />

                        <Stack gap={1}>
                            <Typography variant="h6">Providers</Typography>
                            <Box>
                                <GoogleLogin
                                    onSuccess={(credentialResponse) => {
                                        console.log(credentialResponse);
                                    }}
                                    onError={() => {
                                        console.log('Login Failed');
                                    }}
                                />
                            </Box>
                        </Stack>
                    </Stack>
                </DialogContent>

                <DialogActions>
                    <Button onClick={handleClose} color="inherit">
                        Cancel
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}

export default LoginButton;
