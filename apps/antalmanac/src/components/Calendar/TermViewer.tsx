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
        setTerm(getTerm());
    };

    const updateTermToScheduleMap = () => {
        setTermToScheduleMap(AppStore.getTermToScheduleMap());
    };

    useEffect(() => {
        AppStore.on('addedCoursesChange', handleTermChange);
        AppStore.on('addedCoursesChange', updateTermToScheduleMap);
        AppStore.on('currentScheduleIndexChange', handleTermChange);

        return () => {
            AppStore.removeListener('addedCoursesChange', handleTermChange);
            AppStore.removeListener('addedCoursesChange', updateTermToScheduleMap);
            AppStore.removeListener('currentScheduleIndexChange', handleTermChange);
        };
    }, [handleTermChange, updateTermToScheduleMap]);

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
            {/*Only show option if termToScheduleMap has "MULTIPLE TERMS"*/}
            {termToScheduleMap.has('MULTIPLE TERMS') && <MenuItem value="MULTIPLE TERMS">MULTIPLE TERMS</MenuItem>}

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
            <MenuItem value="NONE" style={{ display: 'none' }}>
                NONE
            </MenuItem>
        </Select>
    );
};

export default TermViewer;
