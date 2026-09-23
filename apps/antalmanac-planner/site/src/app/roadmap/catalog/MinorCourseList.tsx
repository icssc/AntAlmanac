import './MajorCourseList.scss';
import { Collapse } from '@mui/material';
import { FC, useCallback, useEffect, useState } from 'react';

import ClickableDiv from '../../../component/ClickableDiv/ClickableDiv';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
    setMinorRequirements,
    MinorRequirements,
    setGroupExpanded,
} from '../../../store/slices/courseRequirementsSlice';
import trpc from '../../../trpc';
import ProgramRequirementsList from './ProgramRequirementsList';

function getCoursesForMinor(programId: string) {
    return trpc.programs.getRequiredCourses.query({ type: 'minor', programId });
}

interface MinorCourseListProps {
    minorReqs: MinorRequirements;
}

const MinorCourseList: FC<MinorCourseListProps> = ({ minorReqs }) => {
    const storeKeyPrefix = `minor-${minorReqs.minor.id}`;
    const [resultsLoading, setResultsLoading] = useState(false);
    const open = useAppSelector((state) => state.courseRequirements.expandedGroups[storeKeyPrefix] ?? false);
    const setOpen = (isOpen: boolean) => {
        dispatch(setGroupExpanded({ storeKey: storeKeyPrefix, expanded: isOpen }));
    };

    const dispatch = useAppDispatch();

    const fetchRequirements = useCallback(
        async (minorId: string) => {
            setResultsLoading(true);

            try {
                const requirements = await getCoursesForMinor(minorId);
                dispatch(setMinorRequirements({ minorId, requirements }));
            } finally {
                setResultsLoading(false);
            }
        },
        [dispatch]
    );

    useEffect(() => {
        if (!minorReqs.requirements || minorReqs.requirements.length === 0) {
            fetchRequirements(minorReqs.minor.id);
        }
    }, [fetchRequirements, minorReqs.minor.id, minorReqs.requirements]);

    const toggleExpand = () => setOpen(!open);

    return (
        <div className="major-section">
            <ClickableDiv className="header-tab" onClick={toggleExpand}>
                <h4 className="major-name">{minorReqs.minor.name}</h4>
                <ExpandMore className="expand-requirements" expanded={open} onClick={toggleExpand} />
            </ClickableDiv>
            <Collapse in={open} unmountOnExit>
                {resultsLoading ? (
                    <LoadingSpinner />
                ) : (
                    <ProgramRequirementsList requirements={minorReqs.requirements} storeKeyPrefix={storeKeyPrefix} />
                )}
            </Collapse>
        </div>
    );
};

export default MinorCourseList;
