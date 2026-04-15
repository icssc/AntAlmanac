import './MajorCourseList.scss';
import { FC, useCallback, useEffect, useState } from 'react';
import ProgramRequirementsList from './ProgramRequirementsList';
import {
  setMinorRequirements,
  MinorRequirements,
  setGroupExpanded,
} from '../../../store/slices/courseRequirementsSlice';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import trpc from '../../../trpc';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';

import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import { Collapse } from '@mui/material';

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
    [dispatch],
  );

  useEffect(() => {
    if (!minorReqs.requirements || minorReqs.requirements.length === 0) {
      fetchRequirements(minorReqs.minor.id);
    }
  }, [fetchRequirements, minorReqs.minor.id, minorReqs.requirements]);

  const toggleExpand = () => setOpen(!open);

  return (
    <div className="major-section">
      <div
        className="header-tab"
        role="button"
        tabIndex={0}
        onClick={toggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') toggleExpand();
        }}
      >
        <h4 className="major-name">{minorReqs.minor.name}</h4>
        <ExpandMore className="expand-requirements" expanded={open} onClick={toggleExpand} />
      </div>
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
