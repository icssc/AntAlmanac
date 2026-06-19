import { useEffect, useState, useCallback } from 'react';
import type { FormEvent } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Button,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Typography,
  Divider,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import { IosShare, WarningAmber } from '@mui/icons-material';
import { CircularProgress } from '@mui/material';
import { isCustomCourse, quarterDisplayNames } from '../../helpers/planner';
import { type QuarterName } from '@peterportal/types';
import type { PlannerQuarterCourse } from '../../types/types';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import {
  selectAllPlans,
  selectCurrentPlan,
  setToastMsg,
  setShowToast,
  setToastSeverity,
} from '../../store/slices/roadmapSlice';
import { useSaveRoadmap } from '../../hooks/planner';
import { useIsLoggedIn } from '../../hooks/isLoggedIn';
import './Export.scss';
import { useIsMobile } from '../../helpers/util';

// Parse currentWeek like "Week 5 • Spring Quarter 2026"
const parseCurrentWeek = (weekString: string): { week: number; quarter: QuarterName; year: number } | null => {
  const match = weekString.match(/Week (\d+) • (\w+) Quarter (\d+)/);
  if (!match) return null;
  const [, weekStr, quarterStr, yearStr] = match;
  const week = parseInt(weekStr, 10);
  const year = parseInt(yearStr, 10);
  // Map quarter string to QuarterName
  const quarterMap: Record<string, QuarterName> = {
    Fall: 'Fall',
    Winter: 'Winter',
    Spring: 'Spring',
    Summer: 'Summer1', // Fallback to Summer1 if just "Summer"
  };
  const quarter = (quarterMap[quarterStr] ?? quarterStr) as QuarterName;
  return { week, quarter, year };
};

const getQuarterOrder = (quarter: QuarterName): number => {
  const order: Record<QuarterName, number> = {
    Fall: 0,
    Winter: 1,
    Spring: 2,
    Summer1: 2.3,
    Summer10wk: 2.5,
    Summer2: 2.7,
  };
  return order[quarter] ?? 0;
};

// Determine if a quarter's schedule has been released
const isScheduleReleased = (
  targetQuarter: QuarterName,
  targetYear: number,
  currentWeek: { week: number; quarter: QuarterName; year: number } | null,
  now: Date = new Date(),
): boolean => {
  // Summer schedules are released on March 1 of the target year's calendar year
  if (targetQuarter.includes('Summer')) {
    const summerReleaseDate = new Date(targetYear, 2, 1);
    return now >= summerReleaseDate;
  }

  // Regular quarters: released Saturday of week 5 of the previous quarter
  if (!currentWeek) return false;

  // Get previous quarter
  const prevQuarterOrder = getQuarterOrder(targetQuarter) - 1;
  let prevAcademicYear = targetYear;
  let prevQuarterName: QuarterName = 'Fall';

  if (prevQuarterOrder < 0) {
    prevAcademicYear -= 1;
    prevQuarterName = 'Spring'; // Previous quarter before Fall is Spring of previous year
  } else {
    const quarters: QuarterName[] = ['Fall', 'Winter', 'Spring', 'Summer1', 'Summer10wk', 'Summer2'];
    prevQuarterName = quarters.find((q) => getQuarterOrder(q) === prevQuarterOrder) ?? 'Fall';
  }

  const currentAcademicYear = currentWeek.quarter === 'Fall' ? currentWeek.year : currentWeek.year - 1;

  // Check if current time is at or past week 5 of the previous quarter
  if (currentAcademicYear > prevAcademicYear) {
    return true;
  }
  if (
    currentAcademicYear === prevAcademicYear &&
    getQuarterOrder(currentWeek.quarter) > getQuarterOrder(prevQuarterName)
  ) {
    return true;
  }
  if (currentAcademicYear === prevAcademicYear && currentWeek.quarter === prevQuarterName && currentWeek.week > 5) {
    return true;
  }

  return false;
};

// Get next quarter chronologically that has courses
const getNextQuarterWithCourses = (
  roadmapYears: { startYear: number; quarters: { name: QuarterName; courses?: PlannerQuarterCourse[] }[] }[],
  currentWeek: { week: number; quarter: QuarterName; year: number } | null,
): { yearStart: string; quarterName: string } => {
  // Flatten all quarters with their years
  const allQuartersWithYears: Array<{
    yearStart: number;
    quarterName: QuarterName;
  }> = [];

  for (const year of roadmapYears) {
    for (const quarter of year.quarters) {
      if ((quarter.courses ?? []).some((c) => !isCustomCourse(c))) {
        allQuartersWithYears.push({
          yearStart: year.startYear,
          quarterName: quarter.name,
        });
      }
    }
  }

  if (allQuartersWithYears.length === 0) {
    return { yearStart: '', quarterName: '' };
  }

  // If no current week info, just return the first one with courses
  if (!currentWeek) {
    const first = allQuartersWithYears[0];
    return { yearStart: String(first.yearStart), quarterName: first.quarterName };
  }

  allQuartersWithYears.sort((a, b) => {
    const yearDiff = a.yearStart - b.yearStart;
    if (yearDiff !== 0) return yearDiff;
    return getQuarterOrder(a.quarterName) - getQuarterOrder(b.quarterName);
  });

  const currentAcademicYear = currentWeek.quarter === 'Fall' ? currentWeek.year : currentWeek.year - 1;
  const currentQuarterOrder = getQuarterOrder(currentWeek.quarter);

  for (const qtr of allQuartersWithYears) {
    if (qtr.yearStart > currentAcademicYear) {
      return { yearStart: String(qtr.yearStart), quarterName: qtr.quarterName };
    }
    if (qtr.yearStart === currentAcademicYear && getQuarterOrder(qtr.quarterName) > currentQuarterOrder) {
      return { yearStart: String(qtr.yearStart), quarterName: qtr.quarterName };
    }
  }

  // If no future quarter with courses, return the first one
  return { yearStart: String(allQuartersWithYears[0].yearStart), quarterName: allQuartersWithYears[0].quarterName };
};

const getDefaultExportSelection = (
  roadmapYears: { startYear: number; quarters: { name: QuarterName; courses?: PlannerQuarterCourse[] }[] }[],
  currentWeek: { week: number; quarter: QuarterName; year: number } | null,
) => {
  return getNextQuarterWithCourses(roadmapYears, currentWeek);
};

const quarterYearOffsets: Record<QuarterName, number> = {
  Fall: 0,
  Winter: 1,
  Spring: 1,
  Summer1: 1,
  Summer2: 1,
  Summer10wk: 1,
};

const getExportTermYear = (roadmapYearStart: number, quarterName: QuarterName) =>
  roadmapYearStart + (quarterYearOffsets[quarterName] ?? 0);

const getScheduleReleaseComparisonYear = (roadmapYearStart: number, quarterName: QuarterName) =>
  quarterName.includes('Summer') ? getExportTermYear(roadmapYearStart, quarterName) : roadmapYearStart;

const getScheduleWarningText = (quarterName: QuarterName, roadmapYearStart: number) => {
  const exportYear = getExportTermYear(roadmapYearStart, quarterName);
  const quarterLabel = quarterDisplayNames[quarterName] ?? quarterName;

  return `The Schedule of Classes for ${quarterLabel} ${exportYear} may be unavailable.`;
};

const YearDisplayWithRange = ({ year }: { year: { name: string; startYear: number } }) => (
  <Box className="year-display">
    <Typography variant="body2" className="year-display__name">
      {year.name}
    </Typography>
    <Typography variant="caption" className="year-display__range">
      {year.startYear}-{year.startYear + 1}
    </Typography>
  </Box>
);

interface ExportDialogProps {
  showModal: boolean;
  setShowModal: (s: boolean) => void;
}

const ExportDialog = ({ showModal, setShowModal }: ExportDialogProps) => {
  const searchParams = useSearchParams();
  const [selectedRoadmapId, setSelectedRoadmapId] = useState('');
  const [selectedYearStart, setSelectedYearStart] = useState('');
  const [selectedQuarterName, setSelectedQuarterName] = useState('');
  const [autoExport, setAutoExport] = useState(false);
  const [scheduleWarning, setScheduleWarning] = useState('');
  const allPlans = useAppSelector(selectAllPlans);
  const currentPlan = useAppSelector(selectCurrentPlan);
  const { handler: saveRoadmap } = useSaveRoadmap();
  const isLoggedIn = useIsLoggedIn();
  const dispatch = useAppDispatch();
  const [saving, setSaving] = useState(false);
  const currentIndex = useAppSelector((state) => state.roadmap.currentRevisionIndex);
  const lastSavedIndex = useAppSelector((state) => state.roadmap.savedRevisionIndex);
  const schedule = useAppSelector((state) => state.schedule);

  const currentWeek = parseCurrentWeek(schedule?.currentWeek ?? '');

  const selectedRoadmap = allPlans.find((plan) => String(plan.id) === selectedRoadmapId);
  const roadmapYears = selectedRoadmap?.content.yearPlans ?? [];
  const selectedYear = roadmapYears.find((year) => String(year.startYear) === selectedYearStart);
  const yearQuarters = selectedYear?.quarters ?? [];

  const handleClose = () => {
    setShowModal(false);
    setSelectedRoadmapId('');
    setSelectedYearStart('');
    setSelectedQuarterName('');
    setScheduleWarning('');
  };

  const handleRoadmapChange = (event: SelectChangeEvent<string>) => {
    const roadmapId = event.target.value;
    setSelectedRoadmapId(roadmapId);

    const roadmap = allPlans.find((plan) => String(plan.id) === roadmapId);
    const nextSelection = roadmap
      ? getDefaultExportSelection(roadmap.content.yearPlans, currentWeek)
      : { yearStart: '', quarterName: '' };
    setSelectedYearStart(nextSelection.yearStart);
    setSelectedQuarterName(nextSelection.quarterName);
    setScheduleWarning('');

    // Check if schedule is released for the selected quarter
    if (nextSelection.quarterName && nextSelection.yearStart) {
      const exportYearStart = parseInt(nextSelection.yearStart, 10);
      const releaseYear = getScheduleReleaseComparisonYear(exportYearStart, nextSelection.quarterName as QuarterName);
      const released = isScheduleReleased(nextSelection.quarterName as QuarterName, releaseYear, currentWeek);
      if (!released) {
        setScheduleWarning(getScheduleWarningText(nextSelection.quarterName as QuarterName, exportYearStart));
      }
    }
  };

  const handleYearChange = (event: SelectChangeEvent<string>) => {
    const yearStart = event.target.value;
    setSelectedYearStart(yearStart);

    const year = roadmapYears.find((planYear) => String(planYear.startYear) === yearStart);
    const firstQuarterWithCourses = year?.quarters.find((q) => (q.courses ?? []).some((c) => !isCustomCourse(c)));
    setSelectedQuarterName(firstQuarterWithCourses?.name ?? '');
    setScheduleWarning('');

    // Check if schedule is released
    if (firstQuarterWithCourses) {
      const exportYearStart = parseInt(yearStart, 10);
      const releaseYear = getScheduleReleaseComparisonYear(exportYearStart, firstQuarterWithCourses.name);
      const released = isScheduleReleased(firstQuarterWithCourses.name, releaseYear, currentWeek);
      if (!released) {
        setScheduleWarning(getScheduleWarningText(firstQuarterWithCourses.name, exportYearStart));
      }
    }
  };

  const handleQuarterChange = (event: SelectChangeEvent<string>) => {
    const quarterName = event.target.value;
    setSelectedQuarterName(quarterName);
    setScheduleWarning('');

    // Check if schedule is released for this quarter
    if (quarterName && selectedYearStart) {
      const exportYearStart = parseInt(selectedYearStart, 10);
      const releaseYear = getScheduleReleaseComparisonYear(exportYearStart, quarterName as QuarterName);
      const released = isScheduleReleased(quarterName as QuarterName, releaseYear, currentWeek);
      if (!released) {
        setScheduleWarning(getScheduleWarningText(quarterName as QuarterName, exportYearStart));
      }
    }
  };

  const handleExport = useCallback(async () => {
    if (!selectedRoadmap || !selectedYear || !selectedQuarterName) return;
    const quarterName = selectedQuarterName as QuarterName;

    // If user is not logged in, redirect to auth with export params preserved
    if (!isLoggedIn) {
      dispatch(setToastMsg('Sign in to export your roadmap'));
      dispatch(setToastSeverity('info'));
      dispatch(setShowToast(true));
      const returnUrl = new URL(window.location.href);
      returnUrl.searchParams.set('exportRoadmapId', selectedRoadmapId);
      returnUrl.searchParams.set('exportYearStart', selectedYearStart);
      returnUrl.searchParams.set('exportQuarterName', selectedQuarterName);
      const returnTo = encodeURIComponent(returnUrl.toString());
      window.location.assign(`/planner/api/users/auth/google?next=${returnTo}`);
      return;
    }

    let plannerIdToUse: number | undefined = selectedRoadmap.id;

    setSaving(true);
    try {
      if ((selectedRoadmap.id ?? -1) <= 0) {
        const result = await saveRoadmap();
        if (!result || !result.success) {
          dispatch(setToastMsg('Unable to save roadmap before export'));
          dispatch(setToastSeverity('error'));
          dispatch(setShowToast(true));
          return;
        }

        const tempId = selectedRoadmap.id ?? -1;
        plannerIdToUse = result.plannerIdLookup?.[tempId] ?? plannerIdToUse;

        if (!plannerIdToUse || plannerIdToUse <= 0) {
          dispatch(setToastMsg('Please save the roadmap to your account before exporting'));
          dispatch(setToastSeverity('info'));
          dispatch(setShowToast(true));
          return;
        }
      } else if (currentIndex !== lastSavedIndex) {
        await saveRoadmap();
      }
    } finally {
      setSaving(false);
    }

    const url = new URL('/', window.location.origin);
    url.searchParams.set('importRoadmap', String(plannerIdToUse));
    url.searchParams.set('term', `${parseInt(selectedYearStart, 10) + quarterYearOffsets[quarterName]} ${quarterName}`);

    window.location.assign(url.toString());
  }, [
    selectedRoadmap,
    selectedYear,
    selectedQuarterName,
    isLoggedIn,
    selectedRoadmapId,
    selectedYearStart,
    dispatch,
    saveRoadmap,
    currentIndex,
    lastSavedIndex,
  ]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await handleExport();
  };

  // Restore export flow from URL params (e.g., after auth redirect)
  useEffect(() => {
    const roadmapId = searchParams.get('exportRoadmapId');
    const yearStart = searchParams.get('exportYearStart');
    const quarterName = searchParams.get('exportQuarterName');

    if (roadmapId && yearStart && quarterName && allPlans.length > 0 && isLoggedIn) {
      setSelectedRoadmapId(roadmapId);
      setSelectedYearStart(yearStart);
      setSelectedQuarterName(quarterName);
      setShowModal(true);
      setAutoExport(true);
    }
  }, [setShowModal, searchParams, allPlans.length, isLoggedIn]);

  // Auto-trigger export after restoring from URL params
  useEffect(() => {
    if (autoExport && !saving && selectedRoadmapId && selectedYearStart && selectedQuarterName) {
      setAutoExport(false);
      handleExport();
    }
  }, [autoExport, saving, selectedRoadmapId, selectedYearStart, selectedQuarterName, handleExport]);

  useEffect(() => {
    if (!showModal || allPlans.length === 0) return;

    const alreadySelected = allPlans.find((plan) => String(plan.id) === selectedRoadmapId);
    if (alreadySelected) {
      const selectedYearObj = alreadySelected.content.yearPlans.find(
        (year) => String(year.startYear) === selectedYearStart,
      );

      if (!selectedYearObj) {
        const nextSelection = getDefaultExportSelection(alreadySelected.content.yearPlans, currentWeek);
        setSelectedYearStart(nextSelection.yearStart);
        setSelectedQuarterName(nextSelection.quarterName);
      } else if (!selectedYearObj.quarters.some((q) => q.name === selectedQuarterName)) {
        const nextSelection = getDefaultExportSelection(alreadySelected.content.yearPlans, currentWeek);
        setSelectedQuarterName(nextSelection.quarterName);
      }

      return;
    }

    const roadmap = allPlans.find((plan) => plan.id === currentPlan.id) ?? allPlans[0];
    const nextSelection = getDefaultExportSelection(roadmap.content.yearPlans, currentWeek);
    setSelectedRoadmapId(String(roadmap.id));
    setSelectedYearStart(nextSelection.yearStart);
    setSelectedQuarterName(nextSelection.quarterName);
    setScheduleWarning('');

    // Check if schedule is released for the default selection
    if (nextSelection.quarterName && nextSelection.yearStart) {
      const exportYearStart = parseInt(nextSelection.yearStart, 10);
      const releaseYear = getScheduleReleaseComparisonYear(exportYearStart, nextSelection.quarterName as QuarterName);
      const released = isScheduleReleased(nextSelection.quarterName as QuarterName, releaseYear, currentWeek);
      if (!released) {
        setScheduleWarning(getScheduleWarningText(nextSelection.quarterName as QuarterName, exportYearStart));
      }
    }
  }, [showModal, allPlans, currentPlan.id, selectedRoadmapId, selectedYearStart, selectedQuarterName, currentWeek]);

  const roadmapHasNoCourses = () =>
    !roadmapYears.some((y) =>
      (y.quarters || []).some((q) => (q.courses.filter((c) => !isCustomCourse(c)) ?? []).length > 0),
    );

  return (
    <Dialog open={showModal} onClose={handleClose} className="changelog-modal" maxWidth="xs" fullWidth>
      <DialogTitle>Export to Scheduler</DialogTitle>
      <DialogContent>
        <Box component="form" noValidate onSubmit={handleSubmit} className="export-form">
          <FormControl fullWidth>
            <InputLabel id="export-roadmap-label">Roadmap</InputLabel>
            <Select
              labelId="export-roadmap-label"
              label="Roadmap"
              value={selectedRoadmapId ?? ''}
              onChange={handleRoadmapChange}
            >
              {allPlans.map((plan) => (
                <MenuItem key={plan.id} value={String(plan.id)}>
                  {plan.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {roadmapHasNoCourses() ? (
            <p className="export-form__no-courses">This roadmap has no courses to export.</p>
          ) : (
            <Box className="export-form__year-quarter-grid">
              <FormControl fullWidth>
                <InputLabel id="export-year-label">Year</InputLabel>
                <Select
                  labelId="export-year-label"
                  label="Year"
                  value={selectedYearStart ?? ''}
                  onChange={handleYearChange}
                  renderValue={(val) => {
                    const year = roadmapYears.find((y) => String(y.startYear) === String(val));
                    return year ? <YearDisplayWithRange year={year} /> : '';
                  }}
                >
                  {roadmapYears.map((year) => {
                    const hasCourses = year.quarters.some((q) => (q.courses ?? []).some((c) => !isCustomCourse(c)));
                    return (
                      <MenuItem key={year.startYear} value={String(year.startYear)} disabled={!hasCourses}>
                        <YearDisplayWithRange year={year} />
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>

              <FormControl fullWidth disabled={yearQuarters.length === 0}>
                <InputLabel id="export-quarter-label">Quarter</InputLabel>
                <Select
                  labelId="export-quarter-label"
                  label="Quarter"
                  value={selectedQuarterName ?? ''}
                  onChange={handleQuarterChange}
                  renderValue={(val) => quarterDisplayNames[val as QuarterName] ?? ''}
                >
                  {yearQuarters.map((quarter) => {
                    const isDisabled = !(quarter.courses ?? []).some((c) => !isCustomCourse(c));
                    return (
                      <MenuItem key={quarter.name} value={quarter.name} disabled={isDisabled}>
                        {quarterDisplayNames[quarter.name]}
                      </MenuItem>
                    );
                  })}
                </Select>
              </FormControl>
            </Box>
          )}
          {selectedYear && (
            <>
              <Divider></Divider>
              {scheduleWarning && (
                <Box className="export-form__schedule-warning">
                  <WarningAmber className="export-form__schedule-warning-icon" />
                  <Typography variant="body2" className="export-form__schedule-warning-text">
                    {scheduleWarning}
                  </Typography>
                </Box>
              )}
              <Box className="export-form__courses-list">
                <span className="export-form__courses-list-label">Courses to Export:</span>
                {selectedYear.quarters
                  .find((q) => q.name === selectedQuarterName)
                  ?.courses?.filter((course) => !isCustomCourse(course))
                  .map((course) => course.id)
                  .join(', ') ?? 'None'}
              </Box>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="text" color="inherit" onClick={handleClose}>
          Close
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleExport}
          disabled={saving || !selectedRoadmap || !selectedYear || !selectedQuarterName}
          startIcon={saving ? <CircularProgress size={18} color="inherit" /> : undefined}
        >
          {saving ? 'Saving…' : currentIndex !== lastSavedIndex ? 'Save & Export' : 'Export'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const ExportButton = () => {
  const isMobile = useIsMobile();
  const isLoggedIn = useIsLoggedIn();
  const dispatch = useAppDispatch();

  const [showModal, setShowModal] = useState(false);

  const openExportModal = () => {
    if (!isLoggedIn) {
      dispatch(setToastMsg('Sign in to export your roadmap'));
      dispatch(setToastSeverity('info'));
      dispatch(setShowToast(true));
      return;
    }
    setShowModal(true);
  };

  return (
    <>
      {!isMobile && (
        <Button
          className="header-button"
          variant="text"
          size="medium"
          color="inherit"
          startIcon={<IosShare />}
          onClick={openExportModal}
          aria-label="Export"
        >
          Export
        </Button>
      )}
      {isMobile && (
        <IconButton onClick={openExportModal} color="inherit" className="header-button">
          <IosShare />
        </IconButton>
      )}
      <ExportDialog showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};

export default ExportButton;
