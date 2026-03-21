import './ProgramRequirementsList.scss';
import React, { FC, useCallback, useEffect, useState } from 'react';
import {
  COMPLETE_ALL_TEXT,
  formatRequirements,
  LOADING_COURSE_PLACEHOLDER,
  saveMarkerCompletion,
  useCompletionCheck,
  CompletedCourseSet,
  useMatchingGETransfers,
} from '../../../helpers/courseRequirements';
import { CourseNameAndInfo } from '../planner/Course';
import { CourseGQLData } from '../../../types/types';
import trpc from '../../../trpc';
import { programRequirementsSortable } from '../../../helpers/sortable';
import { ReactSortable, SortableEvent } from 'react-sortablejs';
import { useIsMobile } from '../../../helpers/util';
import {
  setActiveCourse,
  setActiveCourseLoading,
  setActiveMissingPrerequisites,
  setSelectedSidebarTab,
  setShowAddCourse,
} from '../../../store/slices/roadmapSlice';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import LoadingSpinner from '../../../component/LoadingSpinner/LoadingSpinner';
import { ProgramRequirement, TransferredGE } from '@peterportal/types';
import { setGroupExpanded, setMarkerComplete } from '../../../store/slices/courseRequirementsSlice';
import { getMissingPrerequisites } from '../../../helpers/planner';
import { useClearedCourses } from '../../../hooks/planner';
import { useTransferredCredits, TransferredCourseWithType } from '../../../hooks/transferCredits';
import { useIsLoggedIn } from '../../../hooks/isLoggedIn';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { Badge, Checkbox, Collapse } from '@mui/material';
import { ExpandMore } from '../../../component/ExpandMore/ExpandMore';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import MenuTile from '../transfers/MenuTile';
import { setShowMobileCreditsMenu } from '../../../store/slices/transferCreditsSlice';

interface SourceOverlayProps {
  completedBy: TransferredCourseWithType['transferType'] | 'roadmap' | null;
}
const SourceOverlay: FC<SourceOverlayProps> = ({ completedBy }) => {
  if (!completedBy || completedBy === 'roadmap') return null;
  const title = `Cleared by ${completedBy === 'AP' ? 'an AP Exam' : 'a transferred course'}`;
  const icon = completedBy === 'AP' ? 'AP' : <SwapHorizOutlinedIcon />;
  return (
    <p className="source-overlay" title={title}>
      {icon}
    </p>
  );
};

interface CourseTileProps {
  courseID: string;
  completedBy: TransferredCourseWithType['transferType'] | 'roadmap' | null;
  /** The timestamp at which the course data is requested to load */
  dragTimestamp?: number;
}
const CourseTile: FC<CourseTileProps> = ({ courseID, completedBy, dragTimestamp = 0 }) => {
  const [courseData, setCourseData] = useState<string | CourseGQLData>(courseID);
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();
  const clearedCourses = useClearedCourses();
  const dispatch = useAppDispatch();

  const loadFullData = useCallback(async () => {
    if (typeof courseData !== 'string') return courseData;
    setLoading(true);
    const response = (await trpc.courses.get.query({ courseID })) as unknown as CourseGQLData;
    setCourseData(response);
    setLoading(false);
    return response;
  }, [courseData, courseID]);

  // Allows for dragging to trigger a data-load & setting active course
  useEffect(() => {
    if (!dragTimestamp) return;
    setLoading(true);
    dispatch(setActiveCourse({ course: LOADING_COURSE_PLACEHOLDER }));
    dispatch(setActiveCourseLoading(true));
    loadFullData().then((res) => {
      dispatch(setActiveCourse({ course: res }));
      dispatch(setActiveCourseLoading(false));
      setLoading(false);
    });
  }, [dispatch, dragTimestamp, loadFullData]);

  const handlePopoverStateChange = (open: boolean) => open && loadFullData();

  const insertCourseOnClick = async () => {
    setLoading(true);
    const fullData = await loadFullData();
    const missingPrerequisites = getMissingPrerequisites(clearedCourses, fullData.prerequisiteTree);
    dispatch(setActiveCourse({ course: fullData as CourseGQLData }));
    dispatch(setActiveMissingPrerequisites(missingPrerequisites));
    dispatch(setShowAddCourse(true));
    setLoading(false);
  };

  const tapProps = { onClick: insertCourseOnClick, role: 'button', tabIndex: 0 };
  const tappableCourseProps = isMobile ? tapProps : {};
  const className = `program-course-tile${isMobile ? ' mobile' : ''}${loading ? ' loading' : ''}${completedBy ? ' completed' : ''}`;
  let fontSize: string | undefined;

  if (courseID.length > 10) {
    const charsExtra = courseID.length - 10;
    const computedSize = 13 - charsExtra;
    fontSize = computedSize + 'px';
  }

  return (
    <div className={className} {...tappableCourseProps} style={{ fontSize }}>
      <SourceOverlay completedBy={completedBy} />
      <CourseNameAndInfo data={courseData} popupListener={handlePopoverStateChange} alwaysCollapse />
      {isMobile && loading && (
        <div className="spinner">
          <LoadingSpinner />
        </div>
      )}
    </div>
  );
};

interface CourseListProps {
  courses: string[];
  takenCourseIDs: CompletedCourseSet;
}
const CourseList: FC<CourseListProps> = ({ courses, takenCourseIDs }) => {
  const isMobile = useIsMobile();
  const [timestamps, setTimestamps] = useState<number[]>(new Array(courses.length).fill(0));

  const setDraggedItem = async (event: SortableEvent) => {
    timestamps[event.oldIndex!] = Date.now();
    setTimestamps(timestamps.slice());
  };

  const courseIDs = courses.map((c) => ({ id: c }));
  return (
    <ReactSortable
      {...programRequirementsSortable}
      list={courseIDs}
      onStart={setDraggedItem}
      disabled={isMobile}
      className={'group-courses' + (isMobile ? ' disabled' : '')}
    >
      {courses.map((c, i) => (
        <CourseTile
          courseID={c}
          key={c}
          completedBy={c in takenCourseIDs ? (takenCourseIDs[c].transferType ?? 'roadmap') : null}
          dragTimestamp={timestamps[i]}
        />
      ))}
    </ReactSortable>
  );
};

interface GroupHeaderProps {
  title: string;
  open: boolean;
  setOpen: React.Dispatch<boolean>;
}
const GroupHeader: FC<GroupHeaderProps> = ({ title, open, setOpen }) => {
  const className = `group-header ${open ? 'open' : ''}`;
  return (
    <div
      className={className}
      role="button"
      tabIndex={0}
      onClick={() => setOpen(!open)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') setOpen(!open);
      }}
    >
      <b>{title}</b>
      <ExpandMore className="expand-requirements" expanded={open} onClick={() => setOpen(!open)} />
    </div>
  );
};

interface GETransferBadgeProps {
  transferredGEs: TransferredGE[];
  complete?: boolean;
  children: React.ReactNode;
}

const GETransferBadge = ({ transferredGEs, complete = false, children }: GETransferBadgeProps) => {
  const badgeColor = complete ? 'success' : 'pending';

  return (
    <Badge
      badgeContent={<SwapHorizIcon />}
      invisible={transferredGEs.length === 0}
      variant="circular"
      color={badgeColor}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
    >
      {children}
    </Badge>
  );
};

interface TransferCreditsTileProps {
  transferredGE: TransferredGE;
  showGETitle?: boolean;
}

const TransferCreditsTile = ({ transferredGE, showGETitle = false }: TransferCreditsTileProps) => {
  const dispatch = useAppDispatch();
  const isMobile = useIsMobile();
  const title = showGETitle ? `Transfer Credits • ${transferredGE.geName}` : 'Transfer Credits';

  return (
    <MenuTile
      title={title}
      onClick={() => {
        if (isMobile) {
          dispatch(setShowMobileCreditsMenu(true));
        } else {
          dispatch(setSelectedSidebarTab(0));
        }
      }}
    >
      <div className="transferred-ges">
        <p>
          Number of Courses: <b>{transferredGE.numberOfCourses}</b>
        </p>
        <p>
          Units Taken: <b>{transferredGE.units}</b>
        </p>
      </div>
    </MenuTile>
  );
};

interface CourseRequirementProps {
  data: ProgramRequirement<'Course' | 'Unit'>;
  takenCourseIDs: CompletedCourseSet;
  storeKey: string;
}
const CourseRequirement: FC<CourseRequirementProps> = ({ data, takenCourseIDs, storeKey }) => {
  const dispatch = useAppDispatch();
  const complete = useCompletionCheck(takenCourseIDs, data).done;
  const open = useAppSelector((state) => state.courseRequirements.expandedGroups[storeKey] ?? false);

  const setOpen = (isOpen: boolean) => {
    dispatch(setGroupExpanded({ storeKey: storeKey, expanded: isOpen }));
  };

  let label: string | number;
  if ('courseCount' in data) {
    label = data.courseCount === data.courses.length ? 'all' : data.courseCount;
  } else {
    label = data.unitCount + ' units';
  }
  const showLabel = data.courses.length > 1 && data.label !== COMPLETE_ALL_TEXT;
  const className = `group-requirement${complete ? ' completed' : ''}`;
  const geTransfers = useMatchingGETransfers(data);

  return (
    <GETransferBadge transferredGEs={geTransfers} complete={complete}>
      <div className={className}>
        <GroupHeader title={data.label} open={open} setOpen={setOpen} />
        <Collapse in={open} unmountOnExit>
          {showLabel && (
            <p className="requirement-label">
              <b>
                Complete {label} of the following{CompletionHint(data, takenCourseIDs)}
              </b>
            </p>
          )}
          {geTransfers.length > 0 && geTransfers.map((ge, i) => <TransferCreditsTile key={i} transferredGE={ge} />)}
          <CourseList courses={data.courses} takenCourseIDs={takenCourseIDs} />
        </Collapse>
      </div>
    </GETransferBadge>
  );
};

const CompletionHint = (data: ProgramRequirement<'Course' | 'Unit'>, takenCourseIDs: CompletedCourseSet) => {
  const showCourseCount = data.courses.length > 0 && 'courseCount' in data;
  const showUnitCount = 'unitCount' in data && data.unitCount > 0;
  const completedCount = useCompletionCheck(takenCourseIDs, data).completed;
  if (showCourseCount) return ` • (${completedCount}/${data.courseCount})`;
  if (showUnitCount) return ` • (${completedCount}/${data.unitCount} units)`;
};

interface GroupedCourseRequirementProps {
  data: ProgramRequirement<'Course' | 'Unit'>;
  takenCourseIDs: CompletedCourseSet;
}
const GroupedCourseRequirement: FC<GroupedCourseRequirementProps> = ({ data, takenCourseIDs }) => {
  const complete = useCompletionCheck(takenCourseIDs, data).done;
  const className = `course-requirement${complete ? ' completed' : ''}`;

  return (
    <>
      <div className={className}>
        <p className="requirement-label">
          <b>
            {data.label}
            {CompletionHint(data, takenCourseIDs)}
          </b>
        </p>
        <CourseList courses={data.courses} takenCourseIDs={takenCourseIDs} />
      </div>
    </>
  );
};

interface GroupRequirementProps {
  data: ProgramRequirement<'Group'>;
  takenCourseIDs: CompletedCourseSet;
  storeKey: string;
}
const GroupRequirement: FC<GroupRequirementProps> = ({ data, takenCourseIDs, storeKey }) => {
  const complete = useCompletionCheck(takenCourseIDs, data).done;
  const open = useAppSelector((state) => state.courseRequirements.expandedGroups[storeKey] ?? false);
  const dispatch = useAppDispatch();

  const setOpen = (isOpen: boolean) => {
    dispatch(setGroupExpanded({ storeKey: storeKey, expanded: isOpen }));
  };

  const className = `group-requirement${complete ? ' completed' : ''}`;
  const geTransfers = useMatchingGETransfers(data);
  const multipleApplicableTransfers = geTransfers.length > 1;

  return (
    <GETransferBadge transferredGEs={geTransfers} complete={complete}>
      <div className={className}>
        <GroupHeader title={data.label} open={open} setOpen={setOpen} />
        <Collapse in={open} unmountOnExit>
          <p className="requirement-label">
            Complete <b>{data.requirementCount}</b> of the following series:
          </p>

          {/** If there are multiple GE transfer categories that apply to fulfill this group, 
          labels should be displayed to differentiate the multiple tiles*/}
          {geTransfers.length > 0 &&
            geTransfers.map((ge, i) => (
              <TransferCreditsTile key={i} transferredGE={ge} showGETitle={multipleApplicableTransfers} />
            ))}

          {data.requirements.map((r, i) => (
            <ProgramRequirementDisplay
              key={i}
              storeKey={`${storeKey}-${i}`}
              requirement={r}
              nested
              takenCourseIDs={takenCourseIDs}
            />
          ))}
        </Collapse>
      </div>
    </GETransferBadge>
  );
};

interface MarkerRequirementProps {
  data: ProgramRequirement<'Marker'>;
  storeKey: string;
}
const MarkerRequirement: FC<MarkerRequirementProps> = ({ data, storeKey }) => {
  const complete = useAppSelector((state) => state.courseRequirements.completedMarkers[data.label]) ?? false;
  const isLoggedIn = useIsLoggedIn();
  const dispatch = useAppDispatch();

  const setComplete = (complete: boolean) => {
    saveMarkerCompletion(data.label, complete, isLoggedIn);
    return dispatch(setMarkerComplete({ markerName: data.label, complete }));
  };

  const className = `marker-requirement${complete ? ' completed' : ''}`;

  return (
    <div className={className}>
      <label>
        <b>{data.label}</b>
        <Checkbox name={'marker-' + storeKey} checked={complete} onChange={(e) => setComplete(e.target.checked)} />
      </label>
    </div>
  );
};

interface ProgramRequirementDisplayProps {
  requirement: ProgramRequirement;
  nested?: boolean;
  takenCourseIDs: CompletedCourseSet;
  storeKey: string;
}
const ProgramRequirementDisplay: FC<ProgramRequirementDisplayProps> = ({
  requirement,
  nested,
  takenCourseIDs,
  storeKey,
}) => {
  switch (requirement.requirementType) {
    case 'Unit':
    case 'Course': {
      return nested ? (
        <GroupedCourseRequirement data={requirement} takenCourseIDs={takenCourseIDs} />
      ) : (
        <CourseRequirement data={requirement} storeKey={storeKey} takenCourseIDs={takenCourseIDs} />
      );
    }
    case 'Group':
      return <GroupRequirement data={requirement} storeKey={storeKey} takenCourseIDs={takenCourseIDs} />;
    case 'Marker':
      return <MarkerRequirement data={requirement} storeKey={storeKey} />;
  }
};

interface RequireCourseListProps {
  requirements: ProgramRequirement[];
  storeKeyPrefix: string;
  skipCollapseSingletons?: boolean;
}
const ProgramRequirementsList: FC<RequireCourseListProps> = ({
  requirements,
  storeKeyPrefix,
  skipCollapseSingletons,
}) => {
  const formattedRequirements = formatRequirements(requirements, skipCollapseSingletons);
  const transferredCourses = useTransferredCredits().courses;
  const roadmapPlans = useAppSelector((state) => state.roadmap.plans);
  const roadmapPlanIndex = useAppSelector((state) => state.roadmap.currentPlanIndex);
  const yearPlans = roadmapPlans[roadmapPlanIndex].content.yearPlans;

  const roadmapCourseMap = yearPlans
    .flatMap((year) => year.quarters)
    .flatMap((quarter) => quarter.courses)
    .map((course) => [course.id, { units: course.minUnits }]);
  const transferCourseMap = transferredCourses.map((t) => [
    t.courseName.replace(/\s/g, ''),
    { units: t.units ?? 0, transferType: t.transferType },
  ]);

  const takenCourseSet: CompletedCourseSet = Object.assign(
    {},
    Object.fromEntries(roadmapCourseMap),
    Object.fromEntries(transferCourseMap),
  );

  return (
    <div className="program-requirements">
      {/* key is ok because we don't reorder these */}
      {formattedRequirements.map((r, i) => (
        <ProgramRequirementDisplay
          requirement={r}
          key={i}
          storeKey={`${storeKeyPrefix}-${i}`}
          takenCourseIDs={takenCourseSet}
        />
      ))}
    </div>
  );
};

export default ProgramRequirementsList;
