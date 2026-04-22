import { useCallback, useEffect, useState } from 'react';

import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { useDepartments } from '$hooks/useDepartments';
import { getLocalStorageRecentlySearched, setLocalStorageRecentlySearched } from '$lib/localStorage';

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

    const departmentsWithAll = departments ? { ...DEFAULT_DEPARTMENTS, ...departments } : DEFAULT_DEPARTMENTS;

    const options = Object.keys(departmentsWithAll);

    const [value, setValue] = useState(() => RightPaneStore.getFormData().deptValue);
    const [recentSearches, setRecentSearches] = useState<typeof options>(() => parseLocalStorageRecentlySearched());

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

            if (recentSearches.includes(newValue)) {
                setRecentSearches((prev) =>
                    prev.sort((a, b) => {
                        return a === newValue ? -1 : b === newValue ? 1 : 0;
                    })
                );
            } else {
                setRecentSearches((prev) => [newValue, ...prev].slice(0, 5));
            }
        },
        [recentSearches, options]
    );

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    useEffect(() => {
        setLocalStorageRecentlySearched(JSON.stringify(recentSearches));
    }, [recentSearches]);

    return (
        <LabeledAutocomplete
            label="Department"
            autocompleteProps={{
                value,
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
