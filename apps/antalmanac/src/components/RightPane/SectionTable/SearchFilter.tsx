import { MenuItem, Select, type SelectChangeEvent } from '@mui/material';

import { SORT_OPTIONS, useSectionFilterStore, type SortOption } from '$stores/SectionFilterStore';

export function SearchFilter() {
    const { sortBy, setSortBy } = useSectionFilterStore();

    const handleChange = (event: SelectChangeEvent<string>) => {
        setSortBy(event.target.value as SortOption);
    };

    return (
        <Select
            value={sortBy}
            onChange={handleChange}
            size="small"
            variant="outlined"
            displayEmpty
            renderValue={(value) => {
                const option = SORT_OPTIONS.find((o) => o.value === value);
                return `SORT: ${option?.label.toUpperCase() ?? ''}`;
            }}
            sx={(theme) => ({
                height: '26px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                textTransform: 'none',
                color: theme.palette.primary.contrastText,
                backgroundColor: theme.palette.primary.main,
                boxShadow: theme.shadows[2],
                '&:hover': {
                    backgroundColor: theme.palette.primary.dark,
                },
                '& .MuiSelect-select': {
                    paddingTop: 0,
                    paddingBottom: 0,
                    paddingLeft: '10px',
                    paddingRight: '28px !important',
                    minHeight: 'unset',
                    display: 'flex',
                    alignItems: 'center',
                    height: '30.75px',
                },
                '& .MuiSelect-icon': {
                    color: theme.palette.primary.contrastText,
                },
                '& .MuiOutlinedInput-notchedOutline': {
                    border: 'none',
                },
            })}
        >
            {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </Select>
    );
}
