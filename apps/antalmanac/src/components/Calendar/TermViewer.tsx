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
            setTerm(getTerm());
        };

        AppStore.on('addedCoursesChange', handleTermChange);
        AppStore.on('currentScheduleIndexChange', handleTermChange);
        return () => {
            AppStore.removeListener('addedCoursesChange', handleTermChange);
            AppStore.removeListener('currentScheduleIndexChange', handleTermChange);
        };
    }, [getTerm]);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedTerm = event.target.value as string;
        setTerm(selectedTerm);
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
