import { LabeledAutocomplete } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledAutocomplete';
import { useCourseSearchParam } from '$components/RightPane/CoursePane/SearchParams/hooks';
import generatedDepartments from '$generated/departments.json';
import { memo, useCallback } from 'react';

const ALL_DEPARTMENTS: Record<string, string> = {
    ALL: 'ALL: Include All Departments',
    ...generatedDepartments,
};

export const DepartmentField = memo(() => {
    const options = Object.keys(ALL_DEPARTMENTS);

    const [deptValue, setDeptValue] = useCourseSearchParam('deptValue');

    const handleChange = useCallback(
        (_: unknown, option: string | null) => {
            const newValue = option ?? options[0]; // options[0] corresponds to `ALL`

            setDeptValue(newValue);

            if (newValue === 'ALL') return;
        },
        [options, setDeptValue]
    );

    return (
        <LabeledAutocomplete
            label="Department"
            autocompleteProps={{
                value: deptValue,
                options: options,
                autoHighlight: true,
                openOnFocus: true,
                getOptionLabel: (option) => ALL_DEPARTMENTS[option.toUpperCase()] ?? option,
                onChange: handleChange,
                includeInputInList: true,
                noOptionsText: 'No departments match the search',
            }}
            textFieldProps={{
                fullWidth: true,
            }}
            isAligned
        />
    );
});

DepartmentField.displayName = 'DepartmentField';
