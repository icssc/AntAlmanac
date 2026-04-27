import { Sort } from '@mui/icons-material';
import { IconButton, Menu, MenuItem, Tooltip, type SxProps } from '@mui/material';
import { useCallback, useState } from 'react';

import { SORT_OPTIONS, useSectionFilterStore, type SortOption } from '$stores/SectionFilterStore';

interface SearchFilterProps {
    buttonSx?: SxProps;
}

export function SearchFilter({ buttonSx }: SearchFilterProps) {
    const { sortBy, setSortBy } = useSectionFilterStore();
    const [anchorEl, setAnchorEl] = useState<HTMLElement>();
    const open = Boolean(anchorEl);

    const handleClick = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleClose = useCallback(() => {
        setAnchorEl(undefined);
    }, []);

    const handleSelect = useCallback(
        (value: SortOption) => {
            setSortBy(value);
            handleClose();
        },
        [setSortBy, handleClose]
    );

    const currentLabel = SORT_OPTIONS.find((o) => o.value === sortBy)?.label ?? 'Default';

    return (
        <>
            <Tooltip title={`Sort: ${currentLabel}`}>
                <IconButton onClick={handleClick} sx={buttonSx}>
                    <Sort />
                </IconButton>
            </Tooltip>

            <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
                {SORT_OPTIONS.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.value === sortBy}
                        onClick={() => handleSelect(option.value)}
                    >
                        {option.label}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}
