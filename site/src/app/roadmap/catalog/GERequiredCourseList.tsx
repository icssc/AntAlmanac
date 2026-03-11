import { FC, useEffect, useState } from 'react';
import ProgramRequirementsList from './ProgramRequirementsList';
import trpc from '../../../trpc';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { setGERequirements } from '../../../store/slices/courseRequirementsSlice';
import { setCHCSelection } from '../../../store/slices/roadmapSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { normalizeTitleLabels } from '../../../helpers/substitutions';
import { Select, MenuItem, Divider } from '@mui/material';
import { ProgramRequirement } from '@peterportal/types';

type UgradRequirementId = 'GE' | 'CHC4' | 'UC' | 'CHC2';

async function fetchUgradRequirements(id: UgradRequirementId) {
  const fetchedRequirements = await trpc.programs.getRequiredCoursesUgrad.query({ id });
  normalizeTitleLabels(fetchedRequirements);

  return fetchedRequirements;
}

type ChcTrackSelection = '' | 'CHC4' | 'CHC2';

const CHCRequirements: FC = () => {
  const dispatch = useAppDispatch();
  const plans = useAppSelector((state) => state.roadmap.plans);
  const planIndex = useAppSelector((state) => state.roadmap.currentPlanIndex);
  const currentPlan = plans[planIndex];
  const selection = currentPlan.chc || '';
  const [requirements, setRequirements] = useState<ProgramRequirement[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selection === '') {
      setRequirements([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchUgradRequirements(selection).then((chcReqs) => {
      const formattedReqs = [];
      for (const req of chcReqs) {
        if (req.requirementType === 'Group' && req.requirementCount === req.requirements.length) {
          formattedReqs.push(...req.requirements);
        } else {
          formattedReqs.push(req);
        }
      }
      setRequirements(formattedReqs);
      setLoading(false);
    });
  }, [selection, requirements.length]);

  const handleSelectionChange = (newSelection: ChcTrackSelection) => {
    dispatch(setCHCSelection({ plannerId: currentPlan.id, chc: newSelection }));
    if (currentPlan.id > 0) {
      trpc.programs.saveCHCSelection.mutate({ plannerId: currentPlan.id, chc: newSelection });
    }
    setRequirements([]);
  };

  const storeKeyPrefix = selection ? selection.toLowerCase() : 'chc';

  return (
    <div>
      <Select
        fullWidth
        displayEmpty
        value={selection}
        onChange={(event) => handleSelectionChange(event.target.value as ChcTrackSelection)}
        className="ppc-combobox"
      >
        <MenuItem key="" value="">
          Not Enrolled in Campuswide Honors
        </MenuItem>
        <MenuItem key="CHC4" value="CHC4">
          4-Year CHC Student
        </MenuItem>
        <MenuItem key="CHC2" value="CHC2">
          2-Year CHC Student
        </MenuItem>
      </Select>
      {loading && <LoadingSpinner />}
      {!loading && requirements.length > 0 && (
        <ProgramRequirementsList requirements={requirements} storeKeyPrefix={storeKeyPrefix} />
      )}
    </div>
  );
};
const GERequiredCourseList: FC = () => {
  const requirements = useAppSelector((state) => state.courseRequirements.geRequirements);

  const [resultsLoading, setResultsLoading] = useState(false);

  const dispatch = useAppDispatch();

  // Initially fetch requirements
  useEffect(() => {
    if (requirements.length) return;

    setResultsLoading(true);
    fetchUgradRequirements('GE').then((geReqs) => {
      dispatch(setGERequirements(geReqs));
      setResultsLoading(false);
    });
  }, [dispatch, requirements]);

  if (resultsLoading) return <LoadingSpinner />;

  return (
    <div className="program-requirements">
      <ProgramRequirementsList requirements={requirements} storeKeyPrefix="ge" />
      <Divider />
      <CHCRequirements />
    </div>
  );
};

export default GERequiredCourseList;
