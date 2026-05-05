import { FriendIdentity } from '$components/Header/Friends/FriendIdentity';
import { UnfriendConfirmationDialog } from '$components/Header/Friends/Friends/UnfriendConfirmationDialog';
import type { Friend } from '$src/backend/lib/rds.types';
import { MoreVert, PersonRemove } from '@mui/icons-material';
import { Box, Button, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { useState } from 'react';

interface FriendDropdownCardProps {
    friend: Friend;
    onView: (friend: Friend) => void;
    onRefresh: () => Promise<void>;
    onMenuOpenChange: (open: boolean) => void;
}

export function FriendDropdownCard({ friend, onView, onRefresh, onMenuOpenChange }: FriendDropdownCardProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);

    const closeMenu = () => {
        setAnchorEl(null);
        onMenuOpenChange(false);
    };

    const closeUnfriendDialog = () => {
        setUnfriendDialogOpen(false);
        onMenuOpenChange(false);
    };

    return (
        <>
            <Box
                sx={(theme) => ({
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    px: 1,
                    py: 0.75,
                    borderRadius: 1,
                    bgcolor: theme.palette.mode === 'dark' ? '#424242' : theme.palette.grey[100],
                    '&:hover': {
                        bgcolor: theme.palette.mode === 'dark' ? 'action.hover' : theme.palette.grey[200],
                    },
                    transition: 'background-color 0.15s ease',
                })}
            >
                <FriendIdentity name={friend.name} email={friend.email} avatar={friend.avatar} />
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button
                        size="small"
                        variant="contained"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.stopPropagation();
                            onView(friend);
                        }}
                        sx={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            textTransform: 'none',
                            py: 0.5,
                            px: 1.5,
                            boxShadow: 2,
                            ml: 1,
                            whiteSpace: 'nowrap',
                            '&:hover': { boxShadow: 3 },
                        }}
                    >
                        View
                    </Button>
                    <IconButton
                        size="small"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                            onMenuOpenChange(true);
                        }}
                        sx={{
                            color: 'text.secondary',
                            ml: 0.5,
                            '&:hover': { bgcolor: 'action.hover', color: 'text.primary' },
                        }}
                    >
                        <MoreVert fontSize="small" />
                    </IconButton>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeMenu}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                        slotProps={{ paper: { sx: { zIndex: 10000 } } }}
                        style={{ zIndex: 10000 }}
                    >
                        <MenuItem
                            onClick={() => {
                                setAnchorEl(null);
                                setUnfriendDialogOpen(true);
                            }}
                            sx={{ color: 'error.main' }}
                        >
                            <PersonRemove sx={{ mr: 1, fontSize: '1.25rem' }} />
                            Unfriend
                        </MenuItem>
                    </Menu>
                </Stack>
            </Box>
            <UnfriendConfirmationDialog
                friendId={friend.id}
                open={unfriendDialogOpen}
                onClose={closeUnfriendDialog}
                onRefresh={onRefresh}
            />
        </>
    );
}
