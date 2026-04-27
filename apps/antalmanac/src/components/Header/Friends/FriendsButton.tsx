import { SignInDialog } from '$components/dialogs/SignInDialog';
import { SETTINGS_POPOVER_BG } from '$components/Header/headerStyles';
import trpc from '$lib/api/trpc';
import { useSessionStore } from '$stores/SessionStore';
import { useThemeStore } from '$stores/SettingsStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { People } from '@mui/icons-material';
import { Button, Popover } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { FriendsMenu, type Friend, type FriendRequest } from './FriendsMenu';

export function FriendsButton() {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const open = Boolean(anchorEl);

    const userId = useSessionStore((store) => store.userId);
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);
    const isDark = useThemeStore((store) => store.isDark);

    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [blockedFriends, setBlockedFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const mapUser = (u: { id: string; name: string | null; email: string | null; avatar: string | null }) => ({
        id: u.id,
        name: u.name ?? undefined,
        email: u.email ?? '',
        avatar: u.avatar ?? undefined,
    });

    const loadFriendsData = useCallback(async () => {
        if (!sessionIsValid || !userId) {
            return;
        }

        setIsLoading(true);
        try {
            const [friendsResult, pendingResult, sentResult, blockedResult] = await Promise.all([
                trpc.friends.getFriends.query(),
                trpc.friends.getPendingRequests.query(),
                trpc.friends.getSentRequests.query(),
                trpc.friends.getBlockedUsers.query(),
            ]);

            setFriends(friendsResult.map(mapUser));
            setFriendRequests(pendingResult.map(mapUser));
            setSentRequests(sentResult.map(mapUser));
            setBlockedFriends(
                (
                    blockedResult as { id: string; name: string | null; email: string | null; avatar: string | null }[]
                ).map(mapUser)
            );

            setDataLoaded(true);
        } catch (error) {
            console.error('Failed to load friends data:', error);
            openSnackbar('error', 'Failed to load friends data.');
        } finally {
            setIsLoading(false);
        }
    }, [userId, sessionIsValid]);

    useEffect(() => {
        if (!sessionIsValid || !userId) {
            setFriendRequests([]);
            setSentRequests([]);
            setFriends([]);
            setBlockedFriends([]);
            setIsLoading(false);
            setDataLoaded(false);
        }
    }, [sessionIsValid, userId]);

    useEffect(() => {
        if (open && sessionIsValid && userId && !dataLoaded) {
            void loadFriendsData();
        }
    }, [open, sessionIsValid, userId, dataLoaded, loadFriendsData]);

    useEffect(() => {
        if (!open || !sessionIsValid || !userId) return;
        let cancelled = false;
        const id = setInterval(async () => {
            try {
                const [friendsResult, pendingResult, sentResult] = await Promise.all([
                    trpc.friends.getFriends.query(),
                    trpc.friends.getPendingRequests.query(),
                    trpc.friends.getSentRequests.query(),
                ]);
                if (cancelled) return;
                setFriends(friendsResult.map(mapUser));
                setFriendRequests(pendingResult.map(mapUser));
                setSentRequests(sentResult.map(mapUser));
            } catch {
                // Silently skip failed polls
            }
        }, 10_000);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [open, sessionIsValid, userId]);

    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        if (sessionIsValid && userId) {
            setAnchorEl(event.currentTarget);
        } else {
            setOpenSignInDialog(true);
        }
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const showLoadingSkeleton = Boolean(open && sessionIsValid && userId && isLoading);

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
                            bgcolor: isDark ? SETTINGS_POPOVER_BG : 'background.paper',
                            color: isDark ? 'white' : 'text.primary',
                        },
                    },
                }}
            >
                <FriendsMenu
                    friendRequests={friendRequests}
                    sentRequests={sentRequests}
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
