import { FriendDropdownCard } from '$components/Header/Friends/Friends/FriendDropdownCard';
import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import type { Friend } from '$src/backend/lib/rds.types';
import { Box, type AutocompleteInputChangeReason } from '@mui/material';
import { useState } from 'react';

interface FriendSearchProps {
    friends: Friend[];
    onView: (friend: Friend) => void;
    onRefresh: () => Promise<void>;
}

export function FriendSearch({ friends, onView, onRefresh }: FriendSearchProps) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [friendMenuOpen, setFriendMenuOpen] = useState(false);

    const filteredFriends = friends.filter(
        (friend) =>
            (friend.name?.toLowerCase() ?? '').includes(query) || (friend.email?.toLowerCase() ?? '').includes(query)
    );

    const getOptionLabel = (friend: Friend) => friend.name ?? friend.email ?? '';
    const filterOptions = (options: Friend[]) => options;

    const handleInputChange = (_event: unknown, inputValue: string, reason: AutocompleteInputChangeReason) => {
        if (reason !== 'input') return;

        const nextQuery = inputValue.toLowerCase().trim();
        setQuery(nextQuery);
        setOpen(Boolean(nextQuery));
    };

    const handleChange = (_event: unknown, friend: Friend | null) => {
        if (!friend) {
            return;
        }

        setOpen(false);
        setQuery('');
        onView(friend);
    };

    const handleClose = () => {
        if (!friendMenuOpen) {
            setOpen(false);
        }
    };

    return (
        <LabeledAutocomplete
            label="Search"
            autocompleteProps={{
                options: filteredFriends,
                value: null,
                inputValue: query,
                open: open || friendMenuOpen,
                autoHighlight: true,
                filterOptions: filterOptions,
                getOptionLabel: getOptionLabel,
                onChange: handleChange,
                onClose: handleClose,
                onInputChange: handleInputChange,
                noOptionsText: 'No friends found',
                popupIcon: '',
                clearOnBlur: false,
                renderOption: (componentProps, friend) => {
                    const { key, ...restProps } = componentProps;

                    return (
                        <Box component="li" key={key} {...restProps} sx={{ p: 0.5 }}>
                            <FriendDropdownCard
                                friend={friend}
                                onView={(selectedFriend) => {
                                    setOpen(false);
                                    setQuery('');
                                    onView(selectedFriend);
                                }}
                                onRefresh={onRefresh}
                                onMenuOpenChange={setFriendMenuOpen}
                            />
                        </Box>
                    );
                },
            }}
            textFieldProps={{
                placeholder: 'Search friend by name or email',
                autoComplete: 'off',
                fullWidth: true,
                onFocus: () => {
                    if (query.trim()) {
                        setOpen(true);
                    }
                },
            }}
            isAligned
        />
    );
}
