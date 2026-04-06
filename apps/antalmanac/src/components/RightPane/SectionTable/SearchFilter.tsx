import { MenuItem, type SelectChangeEvent } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';

import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import RightPaneStore from '$components/RightPane/RightPaneStore';

const GE_LIST = [
    { value: 'ANY', label: 'Clear' },
    { value: 'ANY', label: 'Status' },
    { value: 'GE-1A', label: 'Time' },
    { value: 'GE-1B', label: 'Date: MWF' },
    { value: 'GE-2', label: 'Date: TuTh' },
] as const;

export function SearchFilter() {
    const [ge, setGe] = useState(() => RightPaneStore.getFormData().ge);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;

        setGe(value);
        RightPaneStore.updateFormValue('ge', value);
    };

    const resetField = useCallback(() => {
        setGe(RightPaneStore.getFormData().ge);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    return (
        <LabeledSelect
            label="General Education"
            selectProps={{
                value: ge,
                onChange: handleChange,
                sx: {
                    width: '100%',
                },
            }}
            isAligned={true}
        >
            {GE_LIST.map((category) => {
                return (
                    <MenuItem key={category.value} value={category.value}>
                        {category.label}
                    </MenuItem>
                );
            })}
        </LabeledSelect>
    );
}
