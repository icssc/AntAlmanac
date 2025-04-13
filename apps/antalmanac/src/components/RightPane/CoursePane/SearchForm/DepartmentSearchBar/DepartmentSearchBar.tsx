import { Autocomplete, Box, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { DEPARTMENT_MAP } from '$components/RightPane/CoursePane/SearchForm/DepartmentSearchBar/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { getLocalStorageFavorites, setLocalStorageFavorites } from '$lib/localStorage';

const options = Object.keys(DEPARTMENT_MAP);

// This helper handles parsing the current and prior formats of localStorageFavorites
const parseLocalStorageFavorites = (): string[] => {
    try {
        const data = JSON.parse(getLocalStorageFavorites() ?? '[]');

        if (!Array.isArray(data)) {
            return [];
        }

        if (data.every((x) => typeof x === 'string')) {
            return data;
        }

        if (data.every((x) => typeof x === 'object' && x !== null && 'deptValue' in x)) {
            return data.map((x) => x.deptValue);
        }

        return [];
    } catch (e) {
        console.error('An error occurred:', e);
        return [];
    }
};

export function DepartmentSearchBar() {
    const [value, setValue] = useState(() => RightPaneStore.getFormData().deptValue);
    const [recentSearches, setRecentSearches] = useState<typeof options>(() => parseLocalStorageFavorites());

    const resetField = useCallback(() => {
        setValue(() => RightPaneStore.getFormData().deptValue);
    }, []);

    const handleChange = useCallback(
        (_: unknown, option: string | null) => {
            const newValue = option ?? options[0]; // options[0] corresponds to `ALL`

            setValue(newValue);
            RightPaneStore.updateFormValue('deptValue', newValue);

            const stateObj = { url: 'url' };
            const url = new URL(window.location.href);
            const urlParam = new URLSearchParams(url.search);

            urlParam.delete('deptValue');

            if (newValue != 'ALL') {
                urlParam.append('deptValue', newValue);
            }
            const param = urlParam.toString();
            const new_url = `${param.trim() ? '?' : ''}${param}`;
            history.replaceState(stateObj, 'url', '/' + new_url);

            if (newValue === 'ALL') return;

            recentSearches.includes(newValue)
                ? setRecentSearches((prev) =>
                      prev.sort((a, b) => {
                          return a === newValue ? -1 : b === newValue ? 1 : 0;
                      })
                  )
                : setRecentSearches((prev) => [newValue, ...prev].slice(0, 5));
        },
        [recentSearches]
    );

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    useEffect(() => {
        setLocalStorageFavorites(JSON.stringify(recentSearches));
    }, [recentSearches]);

    return (
        <Box sx={{ flexGrow: 1, width: '50%' }}>
            <Autocomplete
                value={value}
                options={Array.from(new Set<string>([...recentSearches, ...options]))}
                autoHighlight={true}
                openOnFocus={true}
                getOptionLabel={(option) => DEPARTMENT_MAP[option.toUpperCase() as keyof typeof DEPARTMENT_MAP]}
                onChange={handleChange}
                includeInputInList={true}
                noOptionsText="No departments match the search"
                groupBy={(option) => (recentSearches.includes(option) ? 'Recently Searched' : 'Departments')}
                renderInput={(params) => <TextField {...params} label="Department" variant="standard" />}
            />
        </Box>
    );
}
