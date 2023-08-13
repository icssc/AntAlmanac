import { useEffect, useState } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { termData } from '$lib/termData';
import RightPaneStore from '$components/RightPane/RightPaneStore';

interface TermSelectorProps {
    changeState: (field: string, value: string) => void;
    fieldName?: string;
    right_pane?: boolean;
}

const TermSelector = ({ changeState, fieldName = 'term', right_pane = true }: TermSelectorProps) => {
    const getTerm = () => {
        const term = RightPaneStore.getUrlTermValue() || RightPaneStore.getFormData().term;
        // console.log(`TermSelector: getTerm: RightPaneStore.getUrlTermValue() = ${RightPaneStore.getUrlTermValue()}`)
        // console.log(`TermSelector: getTerm: RightPaneStore.getFormData().term = ${RightPaneStore.getFormData().term}`)
        // console.log(`TermSelector: getTerm: term = ${term}`)

        updateTermAndGetFormData(term);

        return term;
    };

    const updateTermAndGetFormData = (term: string) => {
        // RightPaneStore.updateFormValue(fieldName, RightPaneStore.getUrlTermValue());
        RightPaneStore.updateFormValue(fieldName, term);
        return RightPaneStore.getFormData().term;
    };

    const [term, setTerm] = useState(getTerm);

    useEffect(() => {
        const resetField = () => {
            setTerm(RightPaneStore.getFormData().term);
        };

        if (right_pane) {
            RightPaneStore.on('formReset', resetField);
        }

        return () => {
            RightPaneStore.removeListener('formReset', resetField);
        };
    }, [getTerm, right_pane]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedTerm = event.target.value as string;
        setTerm(selectedTerm);
        changeState('term', selectedTerm);

        const url = new URL(window.location.href);
        const urlParam = new URLSearchParams(url.search);
        urlParam.delete('term');
        urlParam.append('term', selectedTerm);
        const param = urlParam.toString();
        const new_url = `${param && param !== 'null' ? '?' : ''}${param}`;
        history.replaceState({ url: 'url' }, 'url', '/' + new_url);
    };

    return (
        <Select value={term} onChange={handleChange} fullWidth={true}>
            {termData.map((term, index) => (
                <MenuItem key={index} value={term.shortName}>
                    {term.longName}
                </MenuItem>
            ))}
            <MenuItem value="MULTIPLE TERMS" style={{ display: 'none' }}>
                MULTIPLE TERMS
            </MenuItem>
            <MenuItem value="NONE" style={{ display: 'none' }}>
                NONE
            </MenuItem>
        </Select>
    );
};

export default TermSelector;
