import { FriendAvatar } from '$components/Header/Friends/FriendAvatar';
import { UnfriendConfirmationDialog } from '$components/Header/Friends/Friends/UnfriendConfirmationDialog';
import type { Friend } from '$src/backend/lib/rds.types';
import { MoreVert, PersonRemove } from '@mui/icons-material';
import { Box, Button, Card, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Stack } from '@mui/material';
import { useState } from 'react';

interface FriendCardProps {
    friend: Friend;
    onView: (friend: Friend) => void;
    onRefresh: () => Promise<void>;
    onMenuOpenChange?: (open: boolean) => void;
    variant?: 'card' | 'option' | 'compact';
}

export function FriendCard({ friend, onView, onRefresh, onMenuOpenChange, variant = 'card' }: FriendCardProps) {
    const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
    const [unfriendDialogOpen, setUnfriendDialogOpen] = useState(false);
    const isOption = variant === 'option';
    const isCompact = variant === 'compact';

    const closeMenu = () => {
        setAnchorEl(null);
        onMenuOpenChange?.(false);
    };

    const closeUnfriendDialog = () => {
        setUnfriendDialogOpen(false);
        onMenuOpenChange?.(false);
    };

    const containerSx = {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        ...(isCompact
            ? {
                  px: 0.5,
                  py: 0.75,
                  borderRadius: 1,
                  '&:hover': {
                      backgroundColor: 'action.hover',
                  },
              }
            : {
                  px: 2,
                  py: 1.5,
              }),
    };

    const content = (
        <>
            <FriendAvatar
                name={friend.name}
                email={friend.email}
                avatar={friend.avatar}
                size={isCompact ? 'compact' : 'default'}
            />
            <Stack direction="row" spacing={0.5} alignItems="center" flexShrink={0}>
                <Button
                    size={isCompact ? 'small' : 'medium'}
                    variant="contained"
                    onClick={() => onView(friend)}
                    sx={{
                        borderRadius: 1,
                        textTransform: 'none',
                        fontWeight: 600,
                        minWidth: isCompact ? 52 : undefined,
                        px: isCompact ? 1.25 : undefined,
                        fontSize: isCompact ? '0.75rem' : undefined,
                    }}
                >
                    View
                </Button>

                {!isCompact && (
                    <>
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
                    </>
                )}
            </Stack>
        </>
    );

    return (
        <>
            {isCompact ? (
                <Box sx={containerSx}>{content}</Box>
            ) : (
                <Card
                    variant={isOption ? 'elevation' : 'outlined'}
                    elevation={isOption ? 0 : undefined}
                    sx={containerSx}
                >
                    {content}
                </Card>
            )}

            <UnfriendConfirmationDialog
                friendId={friend.id}
                open={unfriendDialogOpen}
                onClose={closeUnfriendDialog}
                onRefresh={onRefresh}
            />
        </>
    );
}
