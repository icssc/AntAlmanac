'use client';
import { FC, useRef, useState, useEffect } from 'react';
import './Year.scss';
import Quarter from './Quarter';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import {
  selectCurrentPlan,
  reviseRoadmap,
  setToastMsg,
  setToastSeverity,
  setShowToast,
} from '../../../store/slices/roadmapSlice';
import { pluralize } from '../../../helpers/util';
import { calculateTotalUnits } from '../../../helpers/planner';

import { PlannerYearData } from '../../../types/types';
import EditYearModal from './YearModal';

import {
  Button,
  Box,
  Dialog,
  Card,
  Collapse,
  Divider,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import { deletePlannerYear, modifyPlannerYear } from '../../../helpers/roadmapEdits';

interface YearTitleProps {
  year: PlannerYearData;
  index: number;
}
const YearTitle = ({ year, index }: YearTitleProps) => {
  return (
    <span className="year-title">
      {year.name ? (
        <span className="year-number">{year.name} </span>
      ) : (
        <span className="year-number">Year {index + 1} </span>
      )}
      <span className="year-range">
        ({year.startYear}-{year.startYear + 1})
      </span>
    </span>
  );
};

interface YearStatsProps {
  year: PlannerYearData;
}
const YearStats = ({ year }: YearStatsProps) => {
  const courses = year.quarters.flatMap((quarter) => quarter.courses);

  const { unitCount, courseCount } = calculateTotalUnits(courses);

  return (
    <p className="year-stats">
      <span className="course-count">{courseCount}</span> {pluralize(courseCount, 'courses', 'course')}
      {' • '}
      <span className="unit-count">{unitCount}</span> {pluralize(unitCount, 'units', 'unit')}
    </p>
  );
};

interface DeleteYearModalProps {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
  yearName: string;
  yearIndex: number;
}

const DeleteYearModal = ({ show, setShow, yearName, yearIndex }: DeleteYearModalProps) => {
  const dispatch = useAppDispatch();
  const currentPlan = useAppSelector(selectCurrentPlan);
  const year = currentPlan.content.yearPlans[yearIndex];

  const handleDeleteYear = () => {
    setShow(false);
    const revision = deletePlannerYear(currentPlan.id, year.startYear, year.name, year.collapsed, year.quarters);
    dispatch(reviseRoadmap(revision));
  };

  return (
    <Dialog open={show} onClose={() => setShow(false)} fullWidth>
      <DialogTitle>Delete Year</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate>
          <DialogContentText>Are you sure you want to delete {yearName || `Year ${yearIndex}`}?</DialogContentText>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={() => setShow(false)}>
          Cancel
        </Button>
        <Button color="error" onClick={handleDeleteYear}>
          I am sure
        </Button>
      </DialogActions>
    </Dialog>
  );
};

interface YearProps {
  yearIndex: number;
  data: PlannerYearData;
}

const Year: FC<YearProps> = ({ yearIndex, data }) => {
  const dispatch = useAppDispatch();
  const [collapsed, setCollapsed] = useState(data.collapsed);
  const [showEditYear, setShowEditYear] = useState(false);
  const [showDeleteYear, setShowDeleteYear] = useState(false);
  const [placeholderYear, setPlaceholderYear] = useState(data.startYear);
  const [placeholderName, setPlaceholderName] = useState(data.name);
  const yearContainerRef = useRef<HTMLDivElement>(null);
  const currentPlan = useAppSelector(selectCurrentPlan);

  useEffect(() => {
    setCollapsed(data.collapsed);
  }, [data.collapsed]);

  const handleEditYearClick = () => {
    setPlaceholderYear(data.startYear);
    setPlaceholderName(data.name);
    setShowEditYear(true);
  };

  const handleCollapseClick = () => {
    const newCollapsed = !collapsed;
    setCollapsed(!collapsed);
    const revision = modifyPlannerYear(currentPlan.id, data, {
      newName: data.name,
      newStartYear: data.startYear,
      newCollapsed: newCollapsed,
      addedQuarters: [],
      removedQuarters: [],
    });

    if (revision.edits.length > 0) {
      dispatch(reviseRoadmap(revision));
    }
  };

  return (
    <Card className="year" ref={yearContainerRef} variant="outlined">
      <div className="year-header">
        <YearTitle year={data} index={yearIndex} />
        <YearStats year={data} />
        <div className="action-row">
          <IconButton onClick={handleEditYearClick}>
            <EditIcon />
          </IconButton>
          <IconButton onClick={() => setShowDeleteYear(true)}>
            <DeleteOutlineIcon />
          </IconButton>

          <ExpandMore
            expanded={!collapsed}
            onClick={handleCollapseClick}
            aria-expanded={!collapsed}
            aria-label="expand planner"
          />
        </div>
      </div>
      <EditYearModal
        key={`edit-year-${placeholderYear}-${placeholderName}`}
        placeholderName={placeholderName ?? 'Year ' + (yearIndex + 1)}
        placeholderYear={placeholderYear}
        show={showEditYear}
        setShow={setShowEditYear}
        saveHandler={({ startYear, name, quarters }) => {
          const existing = data.quarters;
          const addedQuarters = quarters.filter(({ name }) => !existing.find((q) => q.name === name));
          const removedQuarters = existing.filter(({ name }) => !quarters.find((q) => q.name === name));

          const hasNameConflict = !!currentPlan.content.yearPlans.find((year) => {
            if (year === data || year.name !== name) return false;
            dispatch(setToastMsg(`The name "${name}" is already used for ${year.startYear}-${year.startYear + 1}!`));
            dispatch(setToastSeverity('error'));
            dispatch(setShowToast(true));
            return true;
          });

          if (hasNameConflict) return;

          const hasStartYearConflict = !!currentPlan.content.yearPlans.find((year) => {
            if (year === data || year.startYear !== startYear) return false;
            dispatch(setToastMsg(`Start year ${startYear} is already used by ${year.name}!`));
            dispatch(setToastSeverity('error'));
            dispatch(setShowToast(true));
            return true;
          });

          if (hasStartYearConflict) return;

          setShowEditYear(false);

          const revision = modifyPlannerYear(currentPlan.id, data, {
            newName: name,
            newStartYear: startYear,
            newCollapsed: data.collapsed,
            addedQuarters,
            removedQuarters,
          });
          if (revision.edits.length > 0) dispatch(reviseRoadmap(revision));
        }}
        currentQuarters={data.quarters.map((q) => q.name)}
        type="edit"
      />
      <DeleteYearModal show={showDeleteYear} setShow={setShowDeleteYear} yearName={data.name} yearIndex={yearIndex} />
      <Collapse in={!collapsed} timeout="auto" unmountOnExit>
        <Divider />
        <Card className="quarter-list" variant="outlined">
          {data.quarters.map((quarter, quarterIndex) => {
            return (
              <Quarter
                key={`year-quarter-${quarterIndex}`}
                yearIndex={yearIndex}
                quarterIndex={quarterIndex}
                data={quarter}
              />
            );
          })}
        </Card>
      </Collapse>
    </Card>
  );
};

export default Year;
