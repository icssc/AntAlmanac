import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useId } from 'react';

import { SORT_OPTIONS, useSectionFilterStore, type SortOption } from '$stores/SectionFilterStore';

export function SearchFilter() {
    const id = useId();
    const { sortBy, setSortBy } = useSectionFilterStore();

    const handleChange = (event: SelectChangeEvent<string>) => {
        setSortBy(event.target.value as SortOption);
    };

    return (
        <FormControl size="small">
            <InputLabel id={id}>Sort By</InputLabel>
            <Select
                labelId={id}
                value={sortBy}
                label="Sort By"
                onChange={handleChange}
                sx={{ height: 32, fontSize: '0.85rem' }}
            >
                {SORT_OPTIONS.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                        {option.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
