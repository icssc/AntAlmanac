import { FormControl, InputLabel, MenuItem, Select } from '@material-ui/core';
import { ChangeEvent, useEffect, useState } from 'react';

import RightPaneStore from '../../RightPaneStore';
import { termData } from '$lib/termData';

interface TermSelectorProps {
    changeTerm: (field: string, value: string) => void;
    fieldName: string;
}

function NewTermSelector(props: TermSelectorProps) {
    const { changeTerm, fieldName } = props;

    const [term, setTerm] = useState(RightPaneStore.getFormData().term);

    const handleChange = (event: ChangeEvent<{ name?: string | undefined; value: unknown }>) => {
        const newValue = event.target.value as string;

        setTerm(newValue);
        changeTerm(fieldName, newValue);

        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('term', newValue);
        history.replaceState({ url: 'url' }, 'url', `/?${urlParams}`);
    };

    const resetField = () => {
        setTerm(RightPaneStore.getFormData().term);
    };

    useEffect(() => {
        RightPaneStore.on('formReset', resetField);

        return () => {
            RightPaneStore.off('formReset', resetField);
        };
    });

    return (
        <FormControl fullWidth>
            <InputLabel>Term</InputLabel>
            <Select value={term} onChange={handleChange}>
                {termData.map((term, index) => (
                    <MenuItem key={index} value={term.shortName}>
                        {term.longName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}

export default NewTermSelector;
