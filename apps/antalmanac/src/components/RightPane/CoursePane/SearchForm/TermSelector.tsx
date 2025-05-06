import { FormControl, InputLabel, MenuItem, Select, type SelectChangeEvent } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';

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
        <FormControl fullWidth>
            <InputLabel variant="standard">Term</InputLabel>
            <Select value={term} onChange={handleChange} fullWidth variant="standard">
                {termData.map((term, index) => (
                    <MenuItem key={index} value={term.shortName}>
                        {term.longName}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );
}
