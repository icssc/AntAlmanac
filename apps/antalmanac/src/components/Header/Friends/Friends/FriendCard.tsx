import { FriendAvatar } from '$components/Header/Friends/FriendAvatar';
import { UnfriendConfirmationDialog } from '$components/Header/Friends/Friends/UnfriendConfirmationDialog';
import type { Friend } from '$src/backend/lib/rds.types';
import { MoreVert, PersonRemove } from '@mui/icons-material';
import { Button, Card, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import { useState } from 'react';

interface FriendCardProps {
    friend: Friend;
    onView: (friend: Friend) => void;
    onRefresh: () => Promise<void>;
    onMenuOpenChange?: (open: boolean) => void;
    variant?: 'card' | 'option';
}

export function FriendCard({ friend, onView, onRefresh, onMenuOpenChange, variant = 'card' }: FriendCardProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
    const isOption = variant === 'option';

    const closeMenu = () => {
        setAnchorEl(null);
        onMenuOpenChange?.(false);
    };

    const closeUnfriendDialog = () => {
        setUnfriendDialogOpen(false);
        onMenuOpenChange?.(false);
    };

    return (
        <>
            <Card
                variant={isOption ? 'elevation' : 'outlined'}
                elevation={isOption ? 0 : undefined}
                sx={{
                    p: 1,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                }}
            >
                <FriendAvatar name={friend.name} email={friend.email} avatar={friend.avatar} />
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button size="small" variant="contained" onClick={() => onView(friend)}>
                        View
                    </Button>

                    <IconButton
                        size="small"
                        onClick={(e) => {
                            if (isOption) {
                                e.stopPropagation();
                            }
                            setAnchorEl(e.currentTarget);
                            onMenuOpenChange?.(true);
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
                    >
                        <MenuItem
                            onClick={(e) => {
                                if (isOption) {
                                    e.stopPropagation();
                                }
                                setAnchorEl(null);
                                setUnfriendDialogOpen(true);
                            }}
                        >
                            <ListItemIcon>
                                <PersonRemove fontSize="small" color="error" />
                            </ListItemIcon>
                            <ListItemText sx={{ color: 'error.main' }}>Unfriend</ListItemText>
                        </MenuItem>
                    </Menu>
                </Stack>
            </Card>

            <UnfriendConfirmationDialog
                friendId={friend.id}
                open={unfriendDialogOpen}
                onClose={closeUnfriendDialog}
                onRefresh={onRefresh}
            />
        </>
    );
}
