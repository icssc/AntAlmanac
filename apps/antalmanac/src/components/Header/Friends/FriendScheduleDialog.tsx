import { addFriendScheduleToMySchedule } from '$actions/AppStoreActions';
import { FriendScheduleView } from '$components/Header/Friends/FriendScheduleView';
import { FriendSelectDropdown } from '$components/Header/Friends/FriendSelectDropdown';
import { FriendScheduleViewProvider } from '$lib/schedule/ScheduleViewContext';
import { useFallbackStore } from '$stores/FallbackStore';
import FriendsStore from '$stores/FriendsStore';
import { Box, Button, CircularProgress, Dialog, Stack, Typography } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

const headerButtonSx = {
    textTransform: 'uppercase',
    fontWeight: 600,
    fontSize: { xs: '0.6875rem', sm: '0.75rem' },
    letterSpacing: '0.05em',
    whiteSpace: 'nowrap',
    px: { xs: 1.5, sm: 2 },
    py: 0.75,
} as const;

export function FriendScheduleDialog() {
    const fallbackMode = useFallbackStore((state) => state.fallbackMode);
    const [open, setOpen] = useState(FriendsStore.isDialogOpen());
    const [friendId, setFriendId] = useState(FriendsStore.getFriendId());
    const [friendName, setFriendName] = useState(FriendsStore.getFriendName() ?? 'Friend');
    const [loading, setLoading] = useState(FriendsStore.isLoading());
    const [addingSchedule, setAddingSchedule] = useState(false);

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

    const handleReturnToManageFriends = () => {
        FriendsStore.returnToManageFriends();
    };

    const handleAddToMySchedule = async () => {
        setAddingSchedule(true);
        try {
            await addFriendScheduleToMySchedule(friendName);
        } finally {
            setAddingSchedule(false);
        }
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
                        minWidth: 0,
                    }}
                >
                    Viewing
                    <FriendSelectDropdown currentFriendId={friendId} currentFriendName={friendName} />
                    &apos;s Schedule
                </Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" flexShrink={0}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        onClick={handleReturnToManageFriends}
                        sx={headerButtonSx}
                    >
                        Return to Manage Friends
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleAddToMySchedule}
                        disabled={fallbackMode || addingSchedule || loading}
                        sx={headerButtonSx}
                    >
                        {addingSchedule ? <CircularProgress size={18} color="inherit" /> : 'Add to my Schedule'}
                    </Button>
                </Stack>
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
