import { FriendScheduleView } from '$components/Header/Friends/FriendScheduleView';
import { FriendSelectDropdown } from '$components/Header/Friends/FriendSelectDropdown';
import { FriendScheduleViewProvider } from '$lib/schedule/ScheduleViewContext';
import FriendsStore from '$stores/FriendsStore';
import { Close } from '@mui/icons-material';
import { Box, CircularProgress, Dialog, IconButton, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

export function FriendScheduleDialog() {
    const [open, setOpen] = useState(FriendsStore.isDialogOpen());
    const [friendId, setFriendId] = useState(FriendsStore.getFriendId());
    const [friendName, setFriendName] = useState(FriendsStore.getFriendName() ?? 'Friend');
    const [loading, setLoading] = useState(FriendsStore.isLoading());

    const syncFromStore = useCallback(() => {
        setOpen(FriendsStore.isDialogOpen());
        setFriendId(FriendsStore.getFriendId());
        setFriendName(FriendsStore.getFriendName() ?? 'Friend');
        setLoading(FriendsStore.isLoading());
    }, []);

    useEffect(() => {
        FriendsStore.on('friendViewChange', syncFromStore);

        return () => {
            FriendsStore.off('friendViewChange', syncFromStore);
        };
    }, [syncFromStore]);

    const handleClose = () => {
        FriendsStore.closeFriendView();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth={false}
            slotProps={{
                paper: {
                    sx: {
                        width: '80vw',
                        height: '80vh',
                        maxWidth: '80vw',
                        maxHeight: '80vh',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                    },
                },
            }}
        >
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ px: 2, py: 1.5, borderBottom: 1, borderColor: 'divider', flexShrink: 0 }}
            >
                <Typography
                    variant="h6"
                    component="h2"
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        fontSize: { xs: '1rem', sm: '1.25rem' },
                    }}
                >
                    Viewing
                    <FriendSelectDropdown currentFriendId={friendId} currentFriendName={friendName} />
                    &apos;s Schedule
                </Typography>
                <IconButton aria-label="Close friend schedule view" onClick={handleClose} edge="end">
                    <Close />
                </IconButton>
            </Stack>

            <Box
                sx={{
                    flexGrow: 1,
                    height: 0,
                    minHeight: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                }}
            >
                {loading ? (
                    <Stack flex={1} alignItems="center" justifyContent="center">
                        <CircularProgress />
                    </Stack>
                ) : (
                    <FriendScheduleViewProvider>
                        <FriendScheduleView />
                    </FriendScheduleViewProvider>
                )}
            </Box>
        </Dialog>
    );
}
