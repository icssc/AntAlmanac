import { SignInDialog } from '$components/dialogs/SignInDialog';
import { FriendsDialog } from '$components/Header/Friends/FriendsDialog';
import { trpc } from '$lib/api/trpc';
import type { Friend, FriendRequest } from '$src/backend/lib/rds.types';
import { useIsMobile } from '$src/hooks/useIsMobile';
import FriendsStore from '$stores/FriendsStore';
import { useSessionStore } from '$stores/SessionStore';
import { openSnackbar } from '$stores/SnackbarStore';
import { People } from '@mui/icons-material';
import { Button, IconButton } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

export function Friends() {
    const userId = useSessionStore((store) => store.userId);
    const sessionIsValid = useSessionStore((store) => store.sessionIsValid);
    const isMobile = useIsMobile();

    const [open, setOpen] = useState(false);
    const [openSignInDialog, setOpenSignInDialog] = useState(false);
    const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);
    const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
    const [friends, setFriends] = useState<Friend[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);

    const loadFriendsData = useCallback(async () => {
        if (!sessionIsValid || !userId) {
            return;
        }

        setIsLoading(true);
        try {
            const [friendsResult, pendingResult, sentResult] = await Promise.all([
                trpc.friends.getFriends.query(),
                trpc.friends.getPendingRequests.query(),
                trpc.friends.getSentRequests.query(),
            ]);

            setFriends(friendsResult);
            setFriendRequests(pendingResult);
            setSentRequests(sentResult);

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
        const handleOpenManageFriends = () => {
            setOpen(true);
        };

        FriendsStore.on('openManageFriends', handleOpenManageFriends);

        return () => {
            FriendsStore.off('openManageFriends', handleOpenManageFriends);
        };
    }, []);

    useEffect(() => {
        if (!open || !sessionIsValid || !userId) {
            return;
        }

        let cancelled = false;

        const id = setInterval(async () => {
            try {
                const [friendsResult, pendingResult, sentResult] = await Promise.all([
                    trpc.friends.getFriends.query(),
                    trpc.friends.getPendingRequests.query(),
                    trpc.friends.getSentRequests.query(),
                ]);

                if (cancelled) {
                    return;
                }

                setFriends(friendsResult);
                setFriendRequests(pendingResult);
                setSentRequests(sentResult);
            } catch {
                // Silently skip failed polls
            }
        }, 10_000);
        return () => {
            cancelled = true;
            clearInterval(id);
        };
    }, [open, sessionIsValid, userId]);

    const handleClick = () => {
        if (sessionIsValid && userId) {
            setOpen(true);
        } else {
            setOpenSignInDialog(true);
        }
    };

    const handleClose = () => {
        setOpen(false);
    };

    const showLoadingSkeleton = Boolean(open && sessionIsValid && userId && isLoading);

    return (
        <>
            {isMobile ? (
                <IconButton color="inherit" onClick={handleClick}>
                    <People />
                </IconButton>
            ) : (
                <Button
                    variant="text"
                    startIcon={<People />}
                    color="inherit"
                    onClick={handleClick}
                    sx={{ fontSize: 'inherit' }}
                >
                    Friends
                </Button>
            )}

            <FriendsDialog
                open={open}
                friendRequests={friendRequests}
                sentRequests={sentRequests}
                friends={friends}
                isLoading={showLoadingSkeleton}
                onRefresh={loadFriendsData}
                onClose={handleClose}
            />

            <SignInDialog feature="Friends" open={openSignInDialog} onClose={() => setOpenSignInDialog(false)} />
        </>
    );
}
