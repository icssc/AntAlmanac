import { Logout, Settings } from '@mui/icons-material';
import {
    Avatar,
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    ListItemIcon,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Tooltip,
    Typography,
} from '@mui/material';
import { useSnackbar } from 'notistack';
import { useState } from 'react';

import { trpc } from '$lib/trpc';

export function AccountButton() {
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();

    const [username, setUsername] = useState('');

    const [settingsOpen, setSettingsOpen] = useState(false);

    const { enqueueSnackbar } = useSnackbar();

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(undefined);
    };

    const logoutMutation = trpc.auth.logout.useMutation();

    const utils = trpc.useUtils();

    const open = Boolean(anchorEl);

    const logout = async () => {
        await logoutMutation.mutateAsync();
        await utils.auth.status.invalidate();
        handleClose();
    };

    const handleOpenSettings = () => {
        setSettingsOpen(true);
        handleClose();
    };

    const handleCloseSettings = () => {
        setSettingsOpen(false);
    };

    const handleUsernameChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
        setUsername(e.target.value);
    };

    const handleSubmit = async () => {
        if (!username) {
            enqueueSnackbar('Username must not be empty', { variant: 'error' });
            return;
        }
        console.log('new username: ', username);
        enqueueSnackbar('New username set', { variant: 'success' });
    };

    return (
        <>
            <Tooltip title="Account settings">
                <IconButton
                    onClick={handleClick}
                    color="inherit"
                    size="small"
                    aria-controls={open ? 'account-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                >
                    <Avatar sx={{ width: 24, height: 24 }} />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                onClick={handleClose}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                <MenuItem onClick={handleOpenSettings}>
                    <ListItemIcon>
                        <Settings fontSize="small" />
                    </ListItemIcon>
                    Settings
                </MenuItem>
                <MenuItem onClick={logout}>
                    <ListItemIcon>
                        <Logout fontSize="small" />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>

            <Dialog onClose={handleCloseSettings} open={settingsOpen}>
                <DialogTitle>Account Settings</DialogTitle>

                <Divider />

                <DialogContent>
                    <Stack gap={2}>
                        <Typography variant="h6">Change Username</Typography>

                        <Box>
                            <Typography>Enter a unique username.</Typography>
                            <Typography>If the username exists, you will need to claim it.</Typography>
                        </Box>

                        <Stack gap={1}>
                            <TextField onChange={handleUsernameChange} label="Username">
                                Username
                            </TextField>

                            <Box>
                                <Button color="inherit" onClick={handleSubmit}>
                                    Submit
                                </Button>
                            </Box>
                        </Stack>
                    </Stack>
                </DialogContent>
            </Dialog>
        </>
    );
}

export default AccountButton;
