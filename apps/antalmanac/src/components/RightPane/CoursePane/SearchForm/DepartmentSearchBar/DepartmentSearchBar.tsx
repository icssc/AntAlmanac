import { useQueryState } from 'nuqs';
import { useCallback, useEffect, useState } from 'react';

import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import { useDepartments } from '$hooks/useDepartments';
import { getLocalStorageRecentlySearched, setLocalStorageRecentlySearched } from '$lib/localStorage';
import { searchParsers } from '$lib/searchParams';

const DEFAULT_DEPARTMENTS: Record<string, string> = {
    ALL: 'ALL: Include All Departments',
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

export function DepartmentSearchBar() {
    const { departments } = useDepartments();
    const [deptValue, setDeptValue] = useQueryState('deptValue', searchParsers.deptValue);

    const departmentsWithAll = departments ? { ...DEFAULT_DEPARTMENTS, ...departments } : DEFAULT_DEPARTMENTS;

    const options = Object.keys(departmentsWithAll);

    const [recentSearches, setRecentSearches] = useState<typeof options>(() => parseLocalStorageRecentlySearched());

    const handleChange = useCallback(
        (_: unknown, option: string | null) => {
            const newValue = option ?? options[0];

            setDeptValue(newValue);

            if (newValue === 'ALL') return;

            recentSearches.includes(newValue)
                ? setRecentSearches((prev) =>
                      prev.sort((a, b) => {
                          return a === newValue ? -1 : b === newValue ? 1 : 0;
                      })
                  )
                : setRecentSearches((prev) => [newValue, ...prev].slice(0, 5));
        },
        [recentSearches, options, setDeptValue]
    );

    useEffect(() => {
        setLocalStorageRecentlySearched(JSON.stringify(recentSearches));
    }, [recentSearches]);

    return (
        <LabeledAutocomplete
            label="Department"
            autocompleteProps={{
                value: deptValue,
                options: Array.from(new Set([...recentSearches, ...options])),
                autoHighlight: true,
                openOnFocus: true,
                getOptionLabel: (option) => departmentsWithAll[option.toUpperCase()] ?? option,
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
}
