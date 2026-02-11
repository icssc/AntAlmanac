import { PersonAdd, Block, MoreVert } from '@mui/icons-material';
import {
    Box,
    Button,
    Divider,
    IconButton,
    Menu,
    MenuItem,
    Stack,
    TextField,
    Typography,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from '@mui/material';
import { useState } from 'react';

import { useThemeStore } from '$stores/SettingsStore';

interface FriendRequest {
    id: string;
    name?: string;
    email: string;
}

interface Friend {
    id: string;
    name?: string;
    email: string;
}

interface FriendsMenuProps {
    // These will be populated with real data later
    friendRequests?: FriendRequest[];
    friends?: Friend[];
}

// Mock data for demonstration purposes
const MOCK_REQUESTS: FriendRequest[] = [
    { id: '1', name: 'John Doe', email: 'john.doe@uci.edu' },
    { id: '2', email: 'jane.smith@uci.edu' },
];

const MOCK_FRIENDS: Friend[] = [
    { id: '1', name: 'Alice Johnson', email: 'alice.j@uci.edu' },
    { id: '2', name: 'Bob Williams', email: 'bob.w@uci.edu' },
    { id: '3', email: 'charlie.brown@uci.edu' },
];

export function FriendsMenu({ friendRequests = MOCK_REQUESTS, friends = MOCK_FRIENDS }: FriendsMenuProps) {
    const isDark = useThemeStore((store) => store.isDark);
    const [email, setEmail] = useState('');
    const [blockMenuAnchor, setBlockMenuAnchor] = useState<{ element: HTMLElement; requestId: string } | null>(null);
    const [blockDialogOpen, setBlockDialogOpen] = useState(false);
    const [userToBlock, setUserToBlock] = useState<string | null>(null);

    const handleAddFriend = () => {
        // TODO: Implement add friend logic
        console.log('Adding friend:', email);
        setEmail('');
    };

    const handleAccept = (requestId: string) => {
        // TODO: Implement accept logic
        console.log('Accepting request:', requestId);
    };

    const handleDecline = (requestId: string) => {
        // TODO: Implement decline logic
        console.log('Declining request:', requestId);
    };

    const handleOpenBlockMenu = (event: React.MouseEvent<HTMLElement>, requestId: string) => {
        setBlockMenuAnchor({ element: event.currentTarget, requestId });
    };

    const handleCloseBlockMenu = () => {
        setBlockMenuAnchor(null);
    };

    const handleBlockClick = () => {
        if (blockMenuAnchor) {
            setUserToBlock(blockMenuAnchor.requestId);
            setBlockDialogOpen(true);
            handleCloseBlockMenu();
        }
    };

    const handleConfirmBlock = () => {
        if (userToBlock) {
            // TODO: Implement block logic
            console.log('Blocking user:', userToBlock);
            setUserToBlock(null);
            setBlockDialogOpen(false);
        }
    };

    const handleCancelBlock = () => {
        setUserToBlock(null);
        setBlockDialogOpen(false);
    };

    const handleViewSchedule = (friendId: string) => {
        // TODO: Implement view schedule logic
        console.log('Viewing schedule for:', friendId);
    };

    return (
        <>
            <Box>
                {/* Section 1: Add Friends */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            mb: 1,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Add Friends
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Enter email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            fullWidth
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    fontSize: '1rem',
                                },
                            }}
                        />
                        <IconButton
                            onClick={handleAddFriend}
                            disabled={!email.trim()}
                            color="primary"
                            sx={{
                                bgcolor: isDark ? 'primary.dark' : 'primary.main',
                                color: 'white',
                                '&:hover': {
                                    bgcolor: isDark ? 'primary.main' : 'primary.dark',
                                },
                                '&.Mui-disabled': {
                                    bgcolor: 'action.disabledBackground',
                                    color: 'action.disabled',
                                },
                            }}
                        >
                            <PersonAdd />
                        </IconButton>
                    </Stack>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Section 2: Requests */}
                <Box sx={{ mb: 2 }}>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            mb: 1,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Requests
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        {friendRequests.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '1rem' }}>
                                No pending requests
                            </Typography>
                        ) : (
                            friendRequests.map((request) => (
                                <Box
                                    key={request.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        py: 1,
                                        px: 1,
                                        borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '1rem', pl: 0.5 }}>
                                        {request.name || request.email}
                                    </Typography>
                                    <Stack direction="row" spacing={0.5}>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleAccept(request.id)}
                                            sx={{
                                                bgcolor: '#4caf50',
                                                color: 'white',
                                                fontSize: '0.925rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                px: 1.5,
                                                py: 0.5,
                                                boxShadow: 2,
                                                '&:hover': {
                                                    bgcolor: '#388e3c',
                                                    boxShadow: 3,
                                                },
                                            }}
                                        >
                                            Accept
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            onClick={() => handleDecline(request.id)}
                                            sx={{
                                                bgcolor: '#e57373',
                                                color: 'white',
                                                fontSize: '0.925rem',
                                                fontWeight: 600,
                                                textTransform: 'none',
                                                px: 1.5,
                                                py: 0.5,
                                                boxShadow: 2,
                                                '&:hover': {
                                                    bgcolor: '#d32f2f',
                                                    boxShadow: 3,
                                                },
                                            }}
                                        >
                                            Reject
                                        </Button>
                                        <IconButton
                                            size="small"
                                            onClick={(e) => handleOpenBlockMenu(e, request.id)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': {
                                                    bgcolor: 'action.hover',
                                                },
                                            }}
                                        >
                                            <MoreVert fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Section 3: Friends */}
                <Box>
                    <Typography
                        variant="h6"
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 700,
                            mb: 1,
                            letterSpacing: '0.5px',
                        }}
                    >
                        Friends
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        {friends.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 1, fontSize: '1rem' }}>
                                No friends yet
                            </Typography>
                        ) : (
                            friends.map((friend) => (
                                <Box
                                    key={friend.id}
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        py: 1,
                                        px: 1,
                                        borderRadius: 1,
                                        '&:hover': {
                                            bgcolor: 'action.hover',
                                        },
                                    }}
                                >
                                    <Typography variant="body2" sx={{ flex: 1, fontSize: '1rem', pl: 0.5 }}>
                                        {friend.name || friend.email}
                                    </Typography>
                                    <Button
                                        size="small"
                                        variant="contained"
                                        onClick={() => handleViewSchedule(friend.id)}
                                        sx={{
                                            fontSize: '1rem',
                                            fontWeight: 600,
                                            textTransform: 'none',
                                            py: 0.5,
                                            px: 1.5,
                                            boxShadow: 2,
                                            '&:hover': {
                                                boxShadow: 3,
                                            },
                                        }}
                                    >
                                        View Schedule
                                    </Button>
                                </Box>
                            ))
                        )}
                    </Box>
                </Box>
            </Box>

            {/* Block Menu */}
            <Menu
                anchorEl={blockMenuAnchor?.element}
                open={Boolean(blockMenuAnchor)}
                onClose={handleCloseBlockMenu}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                <MenuItem onClick={handleBlockClick} sx={{ color: 'error.main' }}>
                    <Block sx={{ mr: 1, fontSize: '1.25rem' }} />
                    Block User
                </MenuItem>
            </Menu>

            {/* Block Confirmation Dialog */}
            <Dialog open={blockDialogOpen} onClose={handleCancelBlock}>
                <DialogTitle>Block User?</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to block this user? They will no longer be able to send you friend
                        requests.
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCancelBlock} color={isDark ? 'secondary' : 'primary'}>
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmBlock} color="error" variant="contained">
                        Block
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
}
