import { useEffect, useState } from 'react';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';

import { ClassNameMap, Styles } from '@material-ui/core/styles/withStyles';
import { Theme, withStyles } from '@material-ui/core/styles';
import { TermNames } from '@packages/antalmanac-types';
import { termData } from '$lib/termData';
import AppStore from '$stores/AppStore';

const styles: Styles<Theme, object> = {
    rootTermSelector: {
        textAlign: 'center',
    },
};

interface TermViewerProps {
    classes: ClassNameMap;
}

const TermViewer = ({ classes }: TermViewerProps) => {
    const getTerm = () => {
        return AppStore.schedule.getCurrentScheduleTerm();
    };

    const [term, setTerm] = useState(getTerm());
    const [termToScheduleMap, setTermToScheduleMap] = useState(AppStore.getTermToScheduleIndicesMap());

    useEffect(() => {
        const handleTermChange = () => {
            setTermToScheduleMap(AppStore.getTermToScheduleIndicesMap());
            setTerm(getTerm());
        };

        AppStore.on('addedCoursesChange', handleTermChange);
        AppStore.on('currentScheduleIndexChange', handleTermChange);

        return () => {
            AppStore.removeListener('addedCoursesChange', handleTermChange);
            AppStore.removeListener('currentScheduleIndexChange', handleTermChange);
        };
    }, []);

    const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
        const selectedTerm = event.target.value as TermNames;
        setTerm(selectedTerm);

        const termToScheduleMap = AppStore.getTermToScheduleIndicesMap();
        const schedulePairs = termToScheduleMap.get(selectedTerm);

        if (schedulePairs && schedulePairs.length > 0) {
            for (const [scheduleIndex, termName, favorite] of schedulePairs) {
                if (favorite) {
                    AppStore.changeCurrentSchedule(scheduleIndex);
                    return;
                }
            }
        }
    };

    return (
        <Select value={term} onChange={handleChange} fullWidth={true} classes={{ root: classes.rootTermSelector }}>
            {/*Only show Multiple Terms or Any Term option if termToScheduleMap has "MULTIPLE TERMS"*/}
            {termToScheduleMap.has('Multiple Terms') && <MenuItem value="Multiple Terms">Multiple Terms</MenuItem>}

            {termToScheduleMap.has('Any Term') && <MenuItem value="Any Term">Any Term</MenuItem>}

            {termData.map((term, index) => {
                const isTermInMap = termToScheduleMap.has(term.shortName);
                return (
                    <MenuItem key={index} value={term.shortName} disabled={!isTermInMap}>
                        {term.longName}
                    </MenuItem>
                );
            })}
        </Select>
    );
};

export default withStyles(styles)(TermViewer);
