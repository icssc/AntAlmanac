import { MenuItem, type SelectChangeEvent } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { LabeledSelect } from '$components/RightPane/CoursePane/SearchForm/LabeledInputs/LabeledSelect';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { termData } from '$lib/termData';

export function TermSelector() {
    const [term, setTerm] = useState<string>(() => RightPaneStore.getFormData().term);

    const handleChange = (event: SelectChangeEvent<string>) => {
        const value = event.target.value;
        setTerm(value);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('term', value);
        history.replaceState({ url: 'url' }, 'url', `/?${urlParams}`);

        RightPaneStore.updateFormValue('term', value);
    };

    const resetField = useCallback(() => {
        setTerm(RightPaneStore.getFormData().term);
    }, []);

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    }, [resetField]);

    return (
        <LabeledSelect
            label="Term"
            selectProps={{
                value: term,
                onChange: handleChange,
                sx: {
                    width: '100%',
                },
                MenuProps: {
                    marginThreshold: null,
                },
            }}
            isAligned={true}
        >
            {termData.map((term, index) => (
                <MenuItem key={index} value={term.shortName}>
                    {term.longName}
                </MenuItem>
            ))}
        </LabeledSelect>
    );
}
