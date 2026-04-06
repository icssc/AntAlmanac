import { MenuItem, type SelectChangeEvent } from '@mui/material';

import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import { SORT_OPTIONS, useSectionFilterStore, type SortOption } from '$stores/SectionFilterStore';

export function SearchFilter() {
    const { sortBy, setSortBy } = useSectionFilterStore();

    const handleChange = (event: SelectChangeEvent<string>) => {
        setSortBy(event.target.value as SortOption);
    };

    return (
        <LabeledSelect
            label="Sort By"
            selectProps={{
                value: sortBy,
                onChange: handleChange,
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            {SORT_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                    {option.label}
                </MenuItem>
            ))}
        </LabeledSelect>
    );
}
