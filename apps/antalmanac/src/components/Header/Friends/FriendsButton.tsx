import { People } from '@mui/icons-material';
import { Button, Popover } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { FriendsMenu, type Friend, type FriendRequest } from './FriendsMenu';

import { openSnackbar } from '$actions/AppStoreActions';
import { SignInDialog } from '$components/dialogs/SignInDialog';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';

export function FriendsButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const open = Boolean(anchorEl);

    const session = useSessionStore((store) => store.session);
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);
    const isDark = useThemeStore((store) => store.isDark);

    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [blockedFriends, setBlockedFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const loadFriendsData = useCallback(async () => {
        if (!sessionIsValid || !session) {
            return;
        }

        setIsLoading(true);
        try {
            const { users } = await trpc.userData.getUserAndAccountBySessionToken.query({
                token: session,
            });

            const userId = users.id;
            setCurrentUserId(userId);

            const [friendsResult, pendingResult, blockedResult] = await Promise.all([
                trpc.friends.getFriends.query({ userId }),
                trpc.friends.getPendingRequests.query({ userId }),
                trpc.friends.getBlockedUsers.query({ userId }),
            ]);

            setFriends(
                friendsResult.map((friend) => ({
                    id: friend.id,
                    name: friend.name ?? undefined,
                    email: friend.email ?? '',
                }))
            );

            setFriendRequests(
                pendingResult.map((request) => ({
                    id: request.id,
                    name: request.name ?? undefined,
                    email: request.email ?? '',
                }))
            );

            setBlockedFriends(
                (blockedResult as { id: string; name: string | null; email: string | null }[]).map((user) => ({
                    id: user.id,
                    name: user.name ?? undefined,
                    email: user.email ?? '',
                }))
            );
        } catch (error) {
            console.error('Failed to load friends data:', error);
            openSnackbar('error', 'Failed to load friends data.');
        } finally {
            setIsLoading(false);
        }
    }, [session, sessionIsValid]);

    useEffect(() => {
        if (!sessionIsValid || !session) {
            setCurrentUserId(null);
            setFriendRequests([]);
            setFriends([]);
            setBlockedFriends([]);
            setIsLoading(false);
        }
    }, [sessionIsValid, session]);

    useEffect(() => {
        if (open && sessionIsValid && session && currentUserId === null) {
            void loadFriendsData();
        }
    }, [open, sessionIsValid, session, currentUserId, loadFriendsData]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        if (sessionIsValid && session) {
            setAnchorEl(event.currentTarget);
        } else {
            setOpenSignInDialog(true);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const showLoadingSkeleton = Boolean(open && sessionIsValid && session && isLoading);

    return (
        <>
            <Button
                variant="text"
                startIcon={<People />}
                color="inherit"
                onClick={handleClick}
                sx={{ fontSize: 'inherit' }}
            >
                Friends
            </Button>

            <Popover
                open={open}
                anchorEl={anchorEl}
                onClose={handleClose}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                slotProps={{
                    paper: {
                        sx: {
                            width: {
                                xs: 350,
                                sm: 400,
                                md: 425,
                            },
                            p: '16px 20px',
                            borderRadius: 2,
                            border: '1px solid',
                            borderColor: 'background.default',
                        },
                    },
                }}
            >
                <FriendsMenu
                    currentUserId={currentUserId}
                    friendRequests={friendRequests}
                    friends={friends}
                    blockedFriends={blockedFriends}
                    isLoading={showLoadingSkeleton}
                    onRefresh={loadFriendsData}
                />
            </Popover>

            <SignInDialog
                feature="Friends"
                isDark={isDark}
                open={openSignInDialog}
                onClose={() => setOpenSignInDialog(false)}
            />
        </>
    );
}
