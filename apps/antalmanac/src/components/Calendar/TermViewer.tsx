import { useEffect, useState } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import RightPaneStore from '../RightPane/RightPaneStore';
import { termData } from '$lib/termData';
import AppStore from '$stores/AppStore';

// interface TermViewerProps {
// }

const TermViewer = () => {
    const getTerm = () => {
        const term = AppStore.schedule.getCurrentScheduleTerm();
        updateTermAndGetFormData();

        return term;
    };

    const updateTermAndGetFormData = () => {
        // RightPaneStore.updateFormValue(fieldName, RightPaneStore.getUrlTermValue());
        // RightPaneStore.updateFormValue(fieldName, term);
        return RightPaneStore.getFormData().term;
    };

    const [term, setTerm] = useState(getTerm);

    useEffect(() => {
        const resetField = () => {
            setTerm(RightPaneStore.getFormData().term);
        };

        const handleTermChange = () => {
            // debug log the new term
            // console.log('TermSelector: handleTermChange: AppStore.schedule.getCurrentScheduleTerm() = ' + AppStore.schedule.getCurrentScheduleTerm());
            // setTerm(AppStore.schedule.getCurrentScheduleTerm());
            setTerm(getTerm());
        };

        AppStore.on('addedCoursesChange', handleTermChange);
        return () => {
            AppStore.removeListener('addedCoursesChange', handleTermChange);
        };
    }, [getTerm]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedTerm = event.target.value as string;
        setTerm(selectedTerm);
        // changeState('term', selectedTerm);

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

export default TermViewer;
