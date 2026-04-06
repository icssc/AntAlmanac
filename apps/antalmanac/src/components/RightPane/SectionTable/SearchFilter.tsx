import { MenuItem, type SelectChangeEvent } from '@mui/material';
import { useEffect, useCallback, useState } from 'react';

import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import RightPaneStore from '$components/RightPane/RightPaneStore';

const GE_LIST = [
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

        const stateObj = { url: 'url' };
        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);

        urlParam.delete('ge');

        if (value !== 'ANY') {
            urlParam.append('ge', value);
        }

        const param = urlParam.toString();
        const new_url = `${param.trim() ? '?' : ''}${param}`;
        history.replaceState(stateObj, 'url', '/' + new_url);
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
