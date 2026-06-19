'use client';
import { FC, ReactNode, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  defaultPlan,
  getNextPlannerTempId,
  initialPlanState,
  reviseRoadmap,
  setPlanIndex,
  setToastMsg,
  setToastSeverity,
  setShowToast,
} from '../../../store/slices/roadmapSlice';
import './RoadmapMultiplan.scss';
import { makeUniquePlanName } from '../../../helpers/planner';
import ImportTranscriptPopup from './ImportTranscriptPopup';
import ImportZot4PlanPopup from './ImportZot4PlanPopup';

import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import {
  Box,
  Button,
  Dialog,
  IconButton,
  Popover,
  TextField,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { RoadmapPlan } from '../../../types/roadmap';
import { addPlanner, deletePlanner, updatePlannerName } from '../../../helpers/roadmapEdits';
import { deepCopy } from '../../../helpers/util';
import { theme } from '../../../style/theme';

interface RoadmapSelectableItemProps {
  plan: RoadmapPlan;
  index: number;
  clickHandler: () => void;
  editHandler: () => void;
  duplicateHandler: () => void;
  deleteHandler: () => void;
}

const RoadmapSelectableItem: FC<RoadmapSelectableItemProps> = ({
  plan,
  clickHandler,
  editHandler,
  duplicateHandler,
  deleteHandler,
}) => {
  return (
    <div className="select-item">
      <Button variant="text" className="planner-name-btn" onClick={clickHandler}>
        {plan.name}
      </Button>
      <IconButton onClick={editHandler}>
        <EditIcon />
      </IconButton>
      <IconButton onClick={duplicateHandler}>
        <ContentCopyOutlinedIcon />
      </IconButton>
      <IconButton className="delete-btn" onClick={deleteHandler}>
        <DeleteOutlineIcon />
      </IconButton>
    </div>
  );
};

interface MultiplanDropdownProps {
  setEditIndex: (index: number) => void;
  setDeleteIndex: (index: number) => void;
  handleCreate: () => void;
  setNewPlanName: (name: string) => void;
  children?: ReactNode;
}
const MultiplanDropdown: FC<MultiplanDropdownProps> = ({
  children,
  setEditIndex,
  setDeleteIndex,
  setNewPlanName,
  handleCreate,
}) => {
  const dispatch = useAppDispatch();
  const allPlans = useAppSelector((state) => state.roadmap.plans);
  const currentPlanIndex = useAppSelector((state) => state.roadmap.currentPlanIndex);
  const nextPlanTempId = useAppSelector(getNextPlannerTempId);
  const { name } = allPlans[currentPlanIndex];
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const duplicatePlan = (plan: RoadmapPlan) => {
    const newName = makeUniquePlanName(plan.name, allPlans);
    const yearPlans = deepCopy(plan.content.yearPlans);
    const revision = addPlanner(nextPlanTempId, newName, yearPlans);
    dispatch(reviseRoadmap(revision));
    dispatch(setPlanIndex(allPlans.length));
  };

  return (
    <div ref={containerRef}>
      <Button
        className="dropdown-button"
        variant="outlined"
        color="inherit"
        onClick={() => setShowDropdown(!showDropdown)}
        endIcon={<ArrowDropDownIcon />}
        /** @todo potentially add this override to the theme as a variant */
        sx={{ borderColor: theme.palette.text.secondary }}
      >
        {name}
      </Button>
      <Popover
        className="multi-plan-selector"
        open={showDropdown}
        anchorReference="anchorEl"
        anchorEl={containerRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        onClose={() => setShowDropdown(false)}
      >
        {allPlans.map((plan, index) => (
          <RoadmapSelectableItem
            key={plan.name}
            plan={plan}
            index={index}
            clickHandler={() => {
              dispatch(setPlanIndex(index));
              setShowDropdown(false);
            }}
            editHandler={() => {
              setEditIndex(index);
              setNewPlanName(allPlans[index].name);
            }}
            duplicateHandler={() => duplicatePlan(plan)}
            deleteHandler={() => {
              setDeleteIndex(index);
              setNewPlanName(allPlans[index].name);
            }}
          />
        ))}
        <div className="separator-label">
          Add or Import Roadmap
          <hr />
        </div>
        <div className="select-item add-item">
          <Button variant="text" onClick={handleCreate}>
            <AddIcon />
            <span>Blank Roadmap</span>
          </Button>
          <ImportTranscriptPopup />
          <ImportZot4PlanPopup />
        </div>
        {children}
      </Popover>
    </div>
  );
};

const RoadmapMultiplan: FC = () => {
  const dispatch = useAppDispatch();
  const allPlans = useAppSelector((state) => state.roadmap.plans);
  const currentPlanIndex = useAppSelector((state) => state.roadmap.currentPlanIndex);
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [editIdx, setEditIdx] = useState(-1);
  const [delIdx, setDelIdx] = useState(-1);
  const [newPlanName, setNewPlanName] = useState(allPlans[currentPlanIndex].name);
  const nextPlanTempId = useAppSelector(getNextPlannerTempId);
  const isDuplicateName = () => allPlans.find((p) => p.name === newPlanName);

  const addNewPlan = (name: string) => {
    const yearPlans = deepCopy(initialPlanState.yearPlans);
    const revision = addPlanner(nextPlanTempId, name, yearPlans);
    dispatch(reviseRoadmap(revision));
  };

  const deleteCurrentPlan = () => {
    const newIndex = delIdx === currentPlanIndex ? 0 : currentPlanIndex - Number(delIdx < currentPlanIndex);
    const planToDelete = allPlans[delIdx];
    const yearPlans = deepCopy(planToDelete.content.yearPlans);
    const revision = deletePlanner(planToDelete.id, planToDelete.name, yearPlans);
    // Length of all plans is calculated BEFORE delete occurs
    if (allPlans.length === 1) {
      const recreateInitialPlan = addPlanner(nextPlanTempId, "Peter's Roadmap", deepCopy(initialPlanState.yearPlans));
      revision.edits.push(...recreateInitialPlan.edits);
    }
    dispatch(reviseRoadmap(revision));
    dispatch(setPlanIndex(newIndex));
    setDelIdx(-1);
  };

  const handleSubmitNewPlan = () => {
    if (!newPlanName) {
      dispatch(setToastMsg('Name cannot be empty'));
      dispatch(setShowToast(true));
      dispatch(setToastSeverity('error'));
      return;
    }
    if (isDuplicateName()) {
      dispatch(setToastMsg('A plan with that name already exists'));
      dispatch(setShowToast(true));
      dispatch(setToastSeverity('error'));
      return;
    }
    setShowAddPlan(false);
    addNewPlan(newPlanName);
    const newIndex = allPlans.length;
    dispatch(setPlanIndex(newIndex));
  };

  const modifyPlanName = () => {
    if (!newPlanName) {
      dispatch(setToastMsg('Name cannot be empty'));
      dispatch(setShowToast(true));
      dispatch(setToastSeverity('error'));
      return;
    }
    if (isDuplicateName()) {
      dispatch(setToastMsg('A plan with that name already exists'));
      dispatch(setShowToast(true));
      dispatch(setToastSeverity('error'));
      return;
    }

    const plannerToUpdate = allPlans[editIdx];
    const revision = updatePlannerName(plannerToUpdate, newPlanName);
    dispatch(reviseRoadmap(revision));

    setEditIdx(-1);
  };

  const openHandler = () => {
    setShowAddPlan(true);

    const planCount = allPlans?.length ?? 0;
    let newIdx = planCount + 1;
    while (allPlans.find((p) => p.name === `Roadmap ${newIdx}`)) newIdx++;

    setNewPlanName(`Roadmap ${newIdx}`);
  };

  return (
    <MultiplanDropdown
      handleCreate={openHandler}
      setEditIndex={setEditIdx}
      setDeleteIndex={setDelIdx}
      setNewPlanName={setNewPlanName}
    >
      {/* Create Roadmap Modal */}
      <Dialog open={showAddPlan} onClose={() => setShowAddPlan(false)} fullWidth>
        <DialogTitle>New Roadmap</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault(); // prevent submitting form (reloads the page)
              handleSubmitNewPlan();
            }}
          >
            <TextField
              variant="standard"
              label="Roadmap Name"
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              slotProps={{
                htmlInput: {
                  maxLength: 35,
                },
              }}
              placeholder={defaultPlan.name}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="inherit" onClick={() => setShowAddPlan(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => handleSubmitNewPlan()}>
            Create Roadmap
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Roadmap Modal */}
      <Dialog open={editIdx !== -1} onClose={() => setEditIdx(-1)} fullWidth>
        <DialogTitle>Edit Roadmap</DialogTitle>
        <DialogContent>
          <Box
            component="form"
            noValidate
            onSubmit={(e) => {
              e.preventDefault(); // prevent submitting form (reloads the page)
              modifyPlanName();
            }}
          >
            <TextField
              variant="standard"
              label="Roadmap Name"
              type="text"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              slotProps={{
                htmlInput: {
                  maxLength: 35,
                },
              }}
              placeholder={defaultPlan.name}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="inherit" onClick={() => setEditIdx(-1)}>
            Cancel
          </Button>
          <Button type="submit" onClick={() => modifyPlanName()}>
            Save Roadmap
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Roadmap Modal */}
      <Dialog open={delIdx !== -1} onClose={() => setDelIdx(-1)} fullWidth>
        <DialogTitle>{allPlans.length === 1 ? 'Clear Roadmap' : 'Delete Roadmap'}</DialogTitle>
        <DialogContent>
          <Box component="form" noValidate>
            <DialogContentText>
              Are you sure you want to {allPlans.length === 1 ? 'clear' : 'delete'} the roadmap "{newPlanName}"?
            </DialogContentText>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="text" color="inherit" onClick={() => setDelIdx(-1)}>
            Cancel
          </Button>
          <Button color="error" onClick={() => deleteCurrentPlan()}>
            I am sure
          </Button>
        </DialogActions>
      </Dialog>
    </MultiplanDropdown>
  );
};

export default RoadmapMultiplan;
