import { MenuItem, type SelectChangeEvent } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

import { AdornedSelect } from '$components/RightPane/CoursePane/SearchForm/AdornedInputs/AdornedSelect';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import { termData } from '$lib/termData';

interface TermSelectorProps {
    isManual?: boolean;
}

export function TermSelector({ isManual }: TermSelectorProps) {
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
        <AdornedSelect
            label="Term"
            selectProps={{
                value: term,
                onChange: handleChange,
            }}
            formControlProps={{
                fullWidth: true,
            }}
            isManual={isManual}
        >
            {termData.map((term, index) => (
                <MenuItem key={index} value={term.shortName}>
                    {term.longName}
                </MenuItem>
            ))}
        </AdornedSelect>
    );
}
