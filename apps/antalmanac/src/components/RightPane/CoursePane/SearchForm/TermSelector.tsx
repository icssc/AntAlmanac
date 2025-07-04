import { MenuItem, type SelectChangeEvent } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { LabelledSelect } from '$components/RightPane/CoursePane/SearchForm/LabelledInputs/LabelledSelect';
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
        <LabelledSelect
            label="Term"
            selectProps={{
                value: term,
                onChange: handleChange,
                fullWidth: true,
            }}
            fullWidth
            // formControlProps={{
            //     fullWidth: true,
            // }}
            isAligned={true}
        >
            {termData.map((term, index) => (
                <MenuItem key={index} value={term.shortName}>
                    {term.longName}
                </MenuItem>
            ))}
        </LabelledSelect>
    );
}
