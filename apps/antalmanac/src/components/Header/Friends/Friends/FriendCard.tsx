import { FriendIdentity } from '$components/Header/Friends/FriendIdentity';
import { UnfriendConfirmationDialog } from '$components/Header/Friends/Friends/UnfriendConfirmationDialog';
import { friendCardSx } from '$components/Header/Friends/styles';
import type { Friend } from '$src/backend/lib/rds.types';
import { MoreVert, PersonRemove } from '@mui/icons-material';
import { Box, Button, IconButton, Menu, MenuItem, Stack } from '@mui/material';
import { useState } from 'react';

interface FriendCardProps {
    friend: Friend;
    onView: (friend: Friend) => void;
    onRefresh: () => Promise<void>;
    preventBlur?: boolean;
}

export function FriendCard({ friend, onView, onRefresh, preventBlur }: FriendCardProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
    const md = preventBlur ? (e: React.MouseEvent) => e.preventDefault() : undefined;

    return (
        <>
            <Box sx={friendCardSx}>
                <FriendIdentity name={friend.name} email={friend.email} avatar={friend.avatar} />
                <Stack direction="row" spacing={0.5} alignItems="center">
                    <Button
                        size="small"
                        variant="contained"
                        onMouseDown={md}
                        onClick={() => onView(friend)}
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
                        onMouseDown={md}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
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
                        onClose={() => setAnchorEl(null)}
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
                onClose={() => setUnfriendDialogOpen(false)}
                onRefresh={onRefresh}
            />
        </>
    );
}
