import { Autocomplete, Box, TextField } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { DEPARTMENT_MAP } from '$components/RightPane/CoursePane/SearchForm/DeptSearchBar/constants';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { getLocalStorageFavorites, setLocalStorageFavorites } from '$lib/localStorage';

const options = Object.keys(DEPARTMENT_MAP);

export function DepartmentSearchBar() {
    const [value, setValue] = useState(() => RightPaneStore.getFormData().deptValue);
    const [favorites, setFavorites] = useState<typeof options>(() => JSON.parse(getLocalStorageFavorites() ?? '[]'));

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

            if (newValue && newValue != 'ALL') {
                urlParam.append('deptValue', newValue);
            }
            const param = urlParam.toString();
            const new_url = `${param.trim() ? '?' : ''}${param}`;
            history.replaceState(stateObj, 'url', '/' + new_url);

            if (newValue == null || newValue === 'ALL') return;

            favorites.includes(newValue)
                ? setFavorites((prev) =>
                      prev.sort((a, b) => {
                          return a === newValue ? -1 : b === newValue ? 1 : 0;
                      })
                  )
                : setFavorites((prev) => [newValue, ...prev].slice(0, 5));

            setLocalStorageFavorites(JSON.stringify(favorites));
        },
        [favorites]
    );

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    return (
        <Box sx={{ flexGrow: 1, width: '50%' }}>
            <Autocomplete
                value={value}
                options={Array.from(new Set<string>([...favorites, ...options]))}
                autoHighlight={true}
                openOnFocus={true}
                getOptionLabel={(option) => DEPARTMENT_MAP[option as keyof typeof DEPARTMENT_MAP]}
                onChange={handleChange}
                includeInputInList={true}
                noOptionsText="No departments match the search"
                groupBy={(option) => (favorites.includes(option) ? 'Recently Searched' : 'Departments')}
                renderInput={(params) => <TextField {...params} label="Department" variant="standard" />}
            />
        </Box>
    );
}
