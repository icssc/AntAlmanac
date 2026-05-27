import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchForm/SearchParams/hooks';
import generatedDepartments from '$generated/departments.json';
import { getLocalStorageRecentlySearched, setLocalStorageRecentlySearched } from '$lib/localStorage';
import { memo, useCallback, useState } from 'react';

const ALL_DEPARTMENTS: Record<string, string> = {
    ALL: 'ALL: Include All Departments',
    ...generatedDepartments,
};

const parseLocalStorageRecentlySearched = (): string[] => {
    try {
        const data = JSON.parse(getLocalStorageRecentlySearched() ?? '[]');

        if (!Array.isArray(data)) {
            return [];
        }

        if (data.every((x) => typeof x === 'string')) {
            return data;
        }

        return [];
    } catch (e) {
        console.error('An error occurred:', e);
        return [];
    }
};

export const DepartmentSearchBar = memo(() => {
    const options = Object.keys(ALL_DEPARTMENTS);

    const [deptValue, setDeptValue] = useCourseSearchParam('deptValue');
    const [recentSearches, setRecentSearches] = useState<typeof options>(() => parseLocalStorageRecentlySearched());

    const handleChange = useCallback(
        (_: unknown, option: string | null) => {
            const newValue = option ?? options[0]; // options[0] corresponds to `ALL`

            setDeptValue(newValue);

            if (newValue === 'ALL') return;

            const nextRecentSearches = recentSearches.includes(newValue)
                ? [...recentSearches].sort((a, b) => {
                      return a === newValue ? -1 : b === newValue ? 1 : 0;
                  })
                : [newValue, ...recentSearches].slice(0, 5);

            setRecentSearches(nextRecentSearches);
            setLocalStorageRecentlySearched(JSON.stringify(nextRecentSearches));
        },
        [options, recentSearches, setDeptValue]
    );

    return (
        <LabeledAutocomplete
            label="Department"
            autocompleteProps={{
                value: deptValue,
                options: Array.from(new Set([...recentSearches, ...options])),
                autoHighlight: true,
                openOnFocus: true,
                getOptionLabel: (option) => ALL_DEPARTMENTS[option.toUpperCase()] ?? option,
                onChange: handleChange,
                includeInputInList: true,
                noOptionsText: 'No departments match the search',
                groupBy: (option) => (recentSearches.includes(option) ? 'Recently Searched' : 'Departments'),
            }}
            textFieldProps={{
                fullWidth: true,
            }}
            isAligned
        />
    );
});

DepartmentSearchBar.displayName = 'DepartmentSearchBar';
