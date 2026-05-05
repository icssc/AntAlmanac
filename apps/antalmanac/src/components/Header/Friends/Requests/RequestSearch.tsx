import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import trpc from '$lib/api/trpc';
import { openSnackbar } from '$stores/SnackbarStore';
import { PersonAdd } from '@mui/icons-material';
import { IconButton, type AutocompleteInputChangeReason } from '@mui/material';
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

    const handleInputChange = (_event: unknown, inputValue: string, reason: AutocompleteInputChangeReason) => {
        if (reason !== 'input') return;

        setEmail(inputValue);
    };

    return (
        <LabeledAutocomplete
            label="Add Friend"
            autocompleteProps={{
                options: [],
                value: null,
                inputValue: email,
                open: false,
                filterOptions: (options) => options,
                onInputChange: handleInputChange,
                popupIcon: '',
                clearOnBlur: false,
                sx: {
                    '&.MuiAutocomplete-hasPopupIcon .MuiOutlinedInput-root, &.MuiAutocomplete-hasClearIcon .MuiOutlinedInput-root':
                        {
                            pr: 1,
                        },
                },
            }}
            textFieldProps={{
                placeholder: 'Add friend by email',
                autoComplete: 'off',
                fullWidth: true,
                onKeyDown: (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        if (email.trim()) {
                            void handleAddFriend();
                        }
                    }
                },
                InputProps: {
                    endAdornment: (
                        <IconButton
                            edge="end"
                            onClick={handleAddFriend}
                            disabled={!email.trim()}
                            color="primary"
                            size="small"
                            sx={{ p: 0.25, marginRight: 0.25 }}
                        >
                            <PersonAdd fontSize="small" />
                        </IconButton>
                    ),
                },
            }}
            isAligned
        />
    );
}
