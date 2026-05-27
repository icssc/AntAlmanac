import { trpc } from '$lib/api/trpc';
import { openSnackbar } from '$stores/SnackbarStore';
import { PersonAdd } from '@mui/icons-material';
import { IconButton, InputAdornment, TextField } from '@mui/material';
import { useState } from 'react';

interface RequestSearchProps {
    onRefresh: () => Promise<void>;
}

export function RequestSearch({ onRefresh }: RequestSearchProps) {
    const [email, setEmail] = useState('');

    const handleAddFriend = async () => {
        const trimmed = email.trim().toLowerCase();
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

    return (
        <TextField
            variant="standard"
            placeholder="Add friend by email"
            autoComplete="off"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (email.trim()) {
                        void handleAddFriend();
                    }
                }
            }}
            slotProps={{
                input: {
                    endAdornment: (
                        <InputAdornment position="end">
                            <IconButton
                                edge="end"
                                onClick={handleAddFriend}
                                disabled={!email.trim()}
                                color="primary"
                                size="small"
                                sx={{ p: 0.25 }}
                            >
                                <PersonAdd fontSize="small" />
                            </IconButton>
                        </InputAdornment>
                    ),
                },
            }}
        />
    );
}
