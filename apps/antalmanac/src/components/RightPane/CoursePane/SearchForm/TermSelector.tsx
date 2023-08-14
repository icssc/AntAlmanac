import { useEffect, useState } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import { FormControl, Tooltip } from '@material-ui/core';
import WarningIcon from '@material-ui/icons/Warning';

import InputLabel from '@material-ui/core/InputLabel';
import { termData } from '$lib/termData';
import RightPaneStore from '$components/RightPane/RightPaneStore';
import AppStore from '$stores/AppStore';

interface TermSelectorProps {
    changeState: (field: string, value: string) => void;
    fieldName?: string;
}

const TermSelector = ({ changeState, fieldName = 'term' }: TermSelectorProps) => {
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
    const [showWarning, setShowWarning] = useState(false);

    const handleWarning = () => {
        const currentTerm = AppStore.schedule.getCurrentScheduleTerm();
        setShowWarning(currentTerm !== 'NONE' && term !== currentTerm);
    };

    const resetField = () => {
        setTerm(RightPaneStore.getFormData().term);
    };

    useEffect(() => {
        handleWarning();

        RightPaneStore.on('formReset', resetField);
        AppStore.on('addedCoursesChange', handleWarning);
        AppStore.on('currentScheduleIndexChange', handleWarning);
        RightPaneStore.on('formDataChange', handleWarning);

        return () => {
            RightPaneStore.removeListener('formReset', resetField);
            AppStore.removeListener('addedCoursesChange', handleWarning);
            AppStore.removeListener('currentScheduleIndexChange', handleWarning);
            RightPaneStore.removeListener('formDataChange', handleWarning);
        };
    }, [getTerm]);

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
        <div style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
            <FormControl fullWidth>
                <InputLabel>Term</InputLabel>
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
            </FormControl>
            {showWarning && (
                <Tooltip
                    title="Classes will not add because the term selected and the schedule term are different!"
                    placement="right"
                >
                    <div style={{ marginLeft: '8px' }}>
                        <WarningIcon style={{ color: 'yellow' }} />
                    </div>
                </Tooltip>
            )}
        </div>
    );
};

export default TermSelector;
