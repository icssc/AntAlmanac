import { FriendCard } from '$components/Header/Friends/Friends/FriendCard';
import type { Friend } from '$src/backend/lib/rds.types';
import {
    Autocomplete,
    Box,
    Popper,
    TextField,
    type AutocompleteInputChangeReason,
    type PopperProps,
} from '@mui/material';
import { useEffect, useState } from 'react';

interface FriendSearchProps {
    friends: Friend[];
    onView: (friend: Friend) => void;
    onRefresh: () => Promise<void>;
}

function ResponsivePopper(props: PopperProps) {
    const { anchorEl, style, ...rest } = props;
    const [measuredWidth, setMeasuredWidth] = useState<number>();

    useEffect(() => {
        if (!anchorEl || !(anchorEl instanceof HTMLElement)) return;

        const el = anchorEl;
        const update = () => setMeasuredWidth(el.clientWidth);

        update();

        const ro = new ResizeObserver(() => update());
        ro.observe(el);

        window.addEventListener('resize', update);

        return () => {
            ro.disconnect();
            window.removeEventListener('resize', update);
        };
    }, [anchorEl]);

    return (
        <Popper
            {...rest}
            anchorEl={anchorEl}
            style={{
                ...style,
                ...(measuredWidth ? { width: measuredWidth } : null),
            }}
        />
    );
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

    const handleClose = () => {
        if (!friendMenuOpen) {
            setOpen(false);
        }
    };

    return (
        <Autocomplete
            options={filteredFriends}
            value={null}
            inputValue={query}
            open={open || friendMenuOpen}
            autoHighlight
            filterOptions={filterOptions}
            getOptionLabel={getOptionLabel}
            onClose={handleClose}
            onInputChange={handleInputChange}
            noOptionsText="No friends found"
            forcePopupIcon={false}
            popupIcon={null}
            clearOnBlur={false}
            PopperComponent={ResponsivePopper}
            sx={{
                width: '100%',
                '& .MuiAutocomplete-endAdornment': {
                    display: 'none',
                },
                '& .MuiInput-root': {
                    fontSize: '0.9375rem',
                    '&:before': {
                        borderBottomColor: 'divider',
                    },
                    '&:hover:not(.Mui-disabled):before': {
                        borderBottomColor: 'text.secondary',
                    },
                },
                '& .MuiInput-input': {
                    py: 1.25,
                    px: 0,
                },
                '& .MuiInput-input::placeholder': {
                    color: 'text.secondary',
                    opacity: 1,
                },
            }}
            slotProps={{
                listbox: {
                    sx: {
                        '& .MuiAutocomplete-option': {
                            width: '100%',
                            p: 0,
                            cursor: 'auto',
                        },
                    },
                },
            }}
            renderOption={(componentProps, friend) => {
                const { key, onClick: _onClick, ...restProps } = componentProps;

                return (
                    <Box component="li" key={key} {...restProps} onClick={(e) => e.stopPropagation()}>
                        <FriendCard
                            friend={friend}
                            onView={(selectedFriend) => {
                                setOpen(false);
                                setQuery('');
                                onView(selectedFriend);
                            }}
                            onRefresh={onRefresh}
                            onMenuOpenChange={setFriendMenuOpen}
                            variant="option"
                        />
                    </Box>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    variant="standard"
                    placeholder="Search friend by name or email"
                    autoComplete="off"
                    fullWidth
                    onFocus={() => {
                        if (query.trim()) {
                            setOpen(true);
                        }
                    }}
                />
            )}
        />
    );
}
