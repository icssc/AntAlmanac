import { FriendIdentity } from '$components/Header/Friends/FriendIdentity';
import { UnfriendConfirmationDialog } from '$components/Header/Friends/Friends/UnfriendConfirmationDialog';
import type { Friend } from '$src/backend/lib/rds.types';
import { MoreVert, PersonRemove } from '@mui/icons-material';
import { Box, Button, IconButton, Menu, MenuItem } from '@mui/material';
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
                sx={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <FriendIdentity name={friend.name} email={friend.email} avatar={friend.avatar} />

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                            onView(friend);
                        }}
                    >
                        View
                    </Button>

                    <IconButton
                        onClick={(e) => {
                            e.stopPropagation();
                            setAnchorEl(e.currentTarget);
                            onMenuOpenChange(true);
                        }}
                    >
                        <MoreVert />
                    </IconButton>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={closeMenu}
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                    >
                        <MenuItem
                            onClick={(e) => {
                                e.stopPropagation();
                                setAnchorEl(null);
                                setUnfriendDialogOpen(true);
                            }}
                            sx={{ color: 'error.main' }}
                        >
                            <PersonRemove />
                            Unfriend
                        </MenuItem>
                    </Menu>
                </Box>
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
