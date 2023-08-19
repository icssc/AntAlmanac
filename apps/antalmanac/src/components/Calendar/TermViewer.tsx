import { useEffect, useState } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { termData } from '$lib/termData';
import AppStore from '$stores/AppStore';

const TermViewer = () => {
    const getTerm = () => {
        return AppStore.schedule.getCurrentScheduleTerm();
    };

    const [term, setTerm] = useState(getTerm());
    const [termToScheduleMap, setTermToScheduleMap] = useState(AppStore.getTermToScheduleMap());

    const handleTermChange = () => {
        setTermToScheduleMap(AppStore.getTermToScheduleMap());
        setTerm(getTerm());
    };

    const updateTermToScheduleMap = () => {
        console.log('termToScheduleMap', termToScheduleMap);
    };

    useEffect(() => {
        AppStore.on('addedCoursesChange', handleTermChange);
        AppStore.on('currentScheduleIndexChange', handleTermChange);

        return () => {
            AppStore.removeListener('addedCoursesChange', handleTermChange);
            AppStore.removeListener('currentScheduleIndexChange', handleTermChange);
        };
    }, [handleTermChange]);

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
            {/*Only show Multiple Terms or None option if termToScheduleMap has "MULTIPLE TERMS"*/}
            {termToScheduleMap.has('MULTIPLE TERMS') && <MenuItem value="MULTIPLE TERMS">Multiple Terms</MenuItem>}

            {termToScheduleMap.has('NONE') && <MenuItem value="NONE">Any Term</MenuItem>}

            {termData.map((term, index) => {
                const isTermInMap = termToScheduleMap.has(term.shortName);
                return (
                    <MenuItem
                        key={index}
                        value={term.shortName}
                        style={{
                            opacity: isTermInMap ? 1 : 0.7,
                        }}
                    >
                        {term.longName}
                    </MenuItem>
                );
            })}
        </Select>
    );
};

export default TermViewer;
