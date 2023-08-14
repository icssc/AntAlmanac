import { useEffect, useState } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { termData } from '$lib/termData';
import AppStore from '$stores/AppStore';

// interface TermViewerProps {
// }

const TermViewer = () => {
    const getTerm = () => {
        return AppStore.schedule.getCurrentScheduleTerm();
    };

    const [term, setTerm] = useState(getTerm);

    useEffect(() => {
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

        const termToScheduleMap = AppStore.getTermToScheduleMap();
        const schedulePairs = termToScheduleMap.get(selectedTerm);

        if (schedulePairs && schedulePairs.length > 0) {
            const scheduleIndex = schedulePairs[0][0];
            AppStore.changeCurrentSchedule(scheduleIndex);
        }
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
