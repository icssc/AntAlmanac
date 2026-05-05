import { RequestCard } from '$components/Header/Friends/Requests/RequestCard';
import { SentRequestCard } from '$components/Header/Friends/Requests/SentRequestCard';
import { textFieldSx } from '$components/Header/Friends/styles';
import trpc from '$lib/api/trpc';
import type { FriendRequest } from '$src/backend/lib/rds.types';
import { openSnackbar } from '$stores/SnackbarStore';
import { PersonAdd } from '@mui/icons-material';
import { Box, Button, IconButton, Stack, TextField, Typography } from '@mui/material';
import { useState } from 'react';

interface RequestsTabProps {
    friendRequests: FriendRequest[];
    sentRequests: FriendRequest[];
    onRefresh: () => Promise<void>;
}

export function RequestsTab({ friendRequests, sentRequests, onRefresh }: RequestsTabProps) {
    const [email, setEmail] = useState('');
    const [subTab, setSubTab] = useState<'received' | 'sent'>('received');

    const handleAddFriend = async () => {
        const trimmed = email.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
            openSnackbar('error', 'Please enter a valid email address.');
            return;
        }
        try {
            await trpc.friends.sendFriendRequestByEmail.mutate({ email: trimmed });
            openSnackbar('success', 'Friend request sent.');
            setEmail('');
            await onRefresh();
        } catch (error) {
            console.error('Error sending friend request:', error);
            const message = error instanceof Error ? error.message : 'Failed to send friend request.';
            openSnackbar('error', message);
        }
    };

    const handleAccept = async (requesterId: string) => {
        try {
            await trpc.friends.acceptFriendRequest.mutate({ requesterId });
            openSnackbar('success', 'Friend request accepted.');
            await onRefresh();
        } catch (error) {
            console.error('Error accepting friend request:', error);
            const message =
                error instanceof Error && error.message.includes('no longer exists')
                    ? 'This friend request is no longer available.'
                    : 'Failed to accept friend request.';
            openSnackbar('error', message);
            await onRefresh();
        }
    };

    const handleDecline = async (requesterId: string) => {
        try {
            await trpc.friends.removeFriend.mutate({ friendId: requesterId });
            openSnackbar('info', 'Friend request declined.');
            await onRefresh();
        } catch (error) {
            console.error('Error declining friend request:', error);
            openSnackbar('error', 'Failed to decline friend request.');
        }
    };

    const handleCancelRequest = async (addresseeId: string) => {
        try {
            await trpc.friends.removeFriend.mutate({ friendId: addresseeId });
            openSnackbar('info', 'Friend request cancelled.');
            await onRefresh();
        } catch (error) {
            console.error('Error cancelling friend request:', error);
            openSnackbar('error', 'Failed to cancel friend request.');
        }
    };

    return (
        <>
            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 2 }}>
                <TextField
                    variant="standard"
                    size="small"
                    placeholder="Add friend by email"
                    autoComplete="off"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            e.preventDefault();
                            if (email.trim()) void handleAddFriend();
                        }
                    }}
                    fullWidth
                    sx={textFieldSx}
                />
                <IconButton
                    onClick={handleAddFriend}
                    disabled={!email.trim()}
                    color="primary"
                    size="small"
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        width: 24,
                        height: 24,
                        p: 0,
                        '&:hover': { bgcolor: 'primary.dark' },
                        '&.Mui-disabled': { bgcolor: 'action.disabledBackground', color: 'action.disabled' },
                    }}
                >
                    <PersonAdd sx={{ fontSize: 14 }} />
                </IconButton>
            </Stack>

            <Stack direction="row" sx={{ mt: 1.5 }} gap={1}>
                {(
                    [
                        { value: 'received', label: 'Received' },
                        { value: 'sent', label: 'Sent' },
                    ] as const
                ).map(({ value, label }) => (
                    <Button
                        key={value}
                        size="small"
                        onClick={() => setSubTab(value)}
                        sx={{
                            minWidth: 0,
                            px: 1,
                            borderRadius: 999,
                            textTransform: 'none',
                            fontSize: '0.875rem',
                            py: 0.4,
                            bgcolor: subTab === value ? '#0000003B' : 'transparent',
                            color: subTab === value ? 'text.primary' : 'text.secondary',
                            '&:hover': { bgcolor: subTab === value ? '#00000055' : 'action.hover' },
                        }}
                    >
                        {label}
                    </Button>
                ))}
            </Stack>

            <Box
                sx={{
                    mt: 1,
                    maxHeight: 260,
                    overflowY: 'auto',
                    '&::-webkit-scrollbar': { width: 6 },
                    '&::-webkit-scrollbar-track': { background: 'none' },
                    '&::-webkit-scrollbar-thumb': { borderRadius: 3, bgcolor: 'action.disabled' },
                }}
            >
                {subTab === 'received' && (
                    <>
                        {friendRequests.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, pl: 0.5 }}>
                                No pending requests
                            </Typography>
                        ) : (
                            friendRequests.map((request) => (
                                <RequestCard
                                    key={request.id}
                                    request={request}
                                    onAccept={handleAccept}
                                    onDecline={handleDecline}
                                />
                            ))
                        )}
                    </>
                )}

                {subTab === 'sent' && (
                    <>
                        {sentRequests.length === 0 ? (
                            <Typography variant="body2" color="text.secondary" sx={{ py: 2, pl: 0.5 }}>
                                No sent requests
                            </Typography>
                        ) : (
                            sentRequests.map((request) => (
                                <SentRequestCard key={request.id} request={request} onCancel={handleCancelRequest} />
                            ))
                        )}
                    </>
                )}
            </Box>
        </>
    );
}
