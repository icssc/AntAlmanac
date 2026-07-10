import './ProgramRequirementsList.scss';
import ClickableDiv from '$planner/component/ClickableDiv/ClickableDiv';
import { ExpandMore } from '$planner/component/ExpandMore/ExpandMore';
import LoadingSpinner from '$planner/component/LoadingSpinner/LoadingSpinner';
import {
    COMPLETE_ALL_TEXT,
    type CompletedCourseSet,
    LOADING_COURSE_PLACEHOLDER,
    formatRequirements,
    saveMarkerCompletion,
    saveOverriddenRequirement,
    useCompletionCheck,
    useMatchingGETransfers,
} from '$planner/helpers/courseRequirements';
import { isCustomCourse } from '$planner/helpers/customCourses';
import { getMissingPrerequisites } from '$planner/helpers/planner';
import { programRequirementsSortable } from '$planner/helpers/sortable';
import { pluralize, useIsMobile } from '$planner/helpers/util';
import { useIsLoggedIn } from '$planner/hooks/isLoggedIn';
import { useClearedCourses } from '$planner/hooks/planner';
import { type TransferredCourseWithType, useTransferredCredits } from '$planner/hooks/transferCredits';
import { useAppDispatch, useAppSelector } from '$planner/store/hooks';
import {
    setGroupExpanded,
    setMarkerComplete,
    setRequirementOverride,
} from '$planner/store/slices/courseRequirementsSlice';
import {
    selectCurrentPlan,
    setActiveCourse,
    setActiveCourseLoading,
    setActiveMissingPrerequisites,
    setSelectedSidebarTab,
    setShowAddCourse,
} from '$planner/store/slices/roadmapSlice';
import { setShowMobileCreditsMenu } from '$planner/store/slices/transferCreditsSlice';
import trpc from '$planner/trpc';
import { type CourseGQLData, type PlannerCourseData } from '$planner/types/types';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle } from '@mui/material';
import { Badge, Checkbox, Collapse } from '@mui/material';
import { type ProgramRequirement, type TransferredGE } from '@packages/planner-types';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { ReactSortable, type SortableEvent } from 'react-sortablejs';

import { CourseNameAndInfo } from '../planner/Course';
import MenuTile from '../transfers/MenuTile';

const DEPARTMENT_GROUPING_COURSE_THRESHOLD = 30;
const COURSE_ID_DEPARTMENT_OVERRIDES = ['IN4MATX'];
const DEPARTMENT_MERGE_SUFFIXES = ['H', 'M'];

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
    const dispatch = useAppDispatch();
    const [timestamps, setTimestamps] = useState<number[]>(Array.from({ length: courses.length }, () => 0));

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
            onEnd={() => dispatch(setActiveCourse(null))}
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

function getCourseDepartment(courseID: string) {
    return (
        COURSE_ID_DEPARTMENT_OVERRIDES.find((override) => courseID.startsWith(override)) ??
        courseID.match(/^\D+/)![0].trim()
    );
}

function normalizeDepartment(department: string, departments: Set<string>) {
    const suffix = DEPARTMENT_MERGE_SUFFIXES.find((suffix) => department.endsWith(suffix));
    const baseDepartment = suffix ? department.slice(0, -suffix.length) : department;
    return departments.has(baseDepartment) ? baseDepartment : department;
}

function getDepartmentCourseGroups(courses: string[]) {
    const groups = new Map<string, string[]>();
    const departments = new Set(courses.map(getCourseDepartment));

    courses.forEach((courseID) => {
        const department = normalizeDepartment(getCourseDepartment(courseID), departments);
        const group = groups.get(department);
        if (group) {
            group.push(courseID);
        } else {
            groups.set(department, [courseID]);
        }
    });

    return Array.from(groups.entries());
}

interface DepartmentCourseGroupProps {
    department: string;
    courses: string[];
    takenCourseIDs: CompletedCourseSet;
    storeKey: string;
}
const DepartmentCourseGroup: FC<DepartmentCourseGroupProps> = ({ department, courses, takenCourseIDs, storeKey }) => {
    const open = useAppSelector((state) => state.courseRequirements.expandedGroups[storeKey] ?? false);
    const dispatch = useAppDispatch();

    const setOpen = (isOpen: boolean) => {
        dispatch(setGroupExpanded({ storeKey, expanded: isOpen }));
    };

    return (
        <div className="department-course-group">
            <ClickableDiv
                className={`department-course-group-header ${open ? 'open' : ''}`}
                onClick={() => setOpen(!open)}
            >
                <b>{department}</b>
                <div className="department-course-group-summary">
                    <span>
                        {courses.length} {pluralize(courses.length, 'courses', 'course')}
                    </span>
                    <ExpandMore className="expand-requirements" expanded={open} onClick={() => setOpen(!open)} />
                </div>
            </ClickableDiv>
            <Collapse in={open} unmountOnExit>
                <div className="department-course-group-courses">
                    <CourseList courses={courses} takenCourseIDs={takenCourseIDs} />
                </div>
            </Collapse>
        </div>
    );
};

interface RequirementCourseListProps {
    courses: string[];
    takenCourseIDs: CompletedCourseSet;
    storeKey: string;
}
const RequirementCourseList: FC<RequirementCourseListProps> = ({ courses, takenCourseIDs, storeKey }) => {
    if (courses.length <= DEPARTMENT_GROUPING_COURSE_THRESHOLD) {
        return <CourseList courses={courses} takenCourseIDs={takenCourseIDs} />;
    }

    return (
        <div className="department-course-groups">
            {getDepartmentCourseGroups(courses).map(([department, departmentCourses]) => (
                <DepartmentCourseGroup
                    key={department}
                    department={department}
                    courses={departmentCourses}
                    takenCourseIDs={takenCourseIDs}
                    storeKey={`${storeKey}-${department}`}
                />
            ))}
        </div>
    );
};

interface ConfirmOverrideModalProps {
    showOverrideModal: boolean;
    setShowOverrideModal: React.Dispatch<React.SetStateAction<boolean>>;
    setOverride: (override: boolean) => void;
}
const ConfirmOverrideModal = ({ showOverrideModal, setShowOverrideModal, setOverride }: ConfirmOverrideModalProps) => {
    const currentPlannerName = useAppSelector((state) => state.roadmap.plans[state.roadmap.currentPlanIndex].name);

    return (
        <Dialog
            open={showOverrideModal}
            onClose={() => setShowOverrideModal(false)}
            onClick={(e) => {
                e.stopPropagation();
            }}
        >
            <DialogTitle>Confirm Force Completion</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Are you sure you want to force complete this requirement for {currentPlannerName}? You should only
                    do this if you are sure the courses you've taken satisfy it.
                </DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button
                    color="inherit"
                    variant="text"
                    onClick={(e) => {
                        e.stopPropagation();
                        setShowOverrideModal(false);
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    color="error"
                    onClick={(e) => {
                        setOverride(true);
                        setShowOverrideModal(false);
                        e.stopPropagation();
                    }}
                >
                    Force Complete
                </Button>
            </DialogActions>
        </Dialog>
    );
};

interface GroupHeaderProps {
    title: string;
    open: boolean;
    setOpen: React.Dispatch<boolean>;
    requirementId: string;
    overridden: boolean;
    setOverride: (override: boolean) => void;
}
const GroupHeader: FC<GroupHeaderProps> = ({ title, open, setOpen, requirementId, overridden, setOverride }) => {
    const className = `group-header ${open ? 'open' : ''}`;
    const [showOverrideModal, setShowOverrideModal] = useState(false);

    return (
        <ClickableDiv className={className} onClick={() => setOpen(!open)}>
            <b>{title}</b>
            <div className="group-header-btns">
                {open && (
                    <Checkbox
                        name={'override-' + requirementId}
                        checked={overridden}
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!overridden) {
                                setShowOverrideModal(true);
                            } else {
                                setOverride(false);
                            }
                        }}
                    />
                )}
                <ConfirmOverrideModal
                    showOverrideModal={showOverrideModal}
                    setShowOverrideModal={setShowOverrideModal}
                    setOverride={setOverride}
                />
                <ExpandMore className="expand-requirements" expanded={open} onClick={() => setOpen(!open)} />
            </div>
        </ClickableDiv>
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
    const complete = useCompletionCheck(takenCourseIDs, data).done;
    const isLoggedIn = useIsLoggedIn();
    const dispatch = useAppDispatch();

    const activePlanID = useAppSelector(selectCurrentPlan)?.id;

    const overridden = useAppSelector(
        (state) => state.courseRequirements.overriddenRequirements[activePlanID]?.[data.requirementId] ?? false
    );

    const setOverride = (override: boolean) => {
        if (!activePlanID) return;
        saveOverriddenRequirement(activePlanID, data.requirementId, override, isLoggedIn);
        dispatch(
            setRequirementOverride({ plannerId: activePlanID, requirement: data.requirementId, override: override })
        );
    };

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
    const groupByDepartment = data.courses.length > DEPARTMENT_GROUPING_COURSE_THRESHOLD;

    const className = `group-requirement${complete || overridden ? ' completed' : ''}`;

    const geTransfers = useMatchingGETransfers(data);

    return (
        <GETransferBadge transferredGEs={geTransfers} complete={complete}>
            <div className={className}>
                <GroupHeader
                    title={data.label}
                    requirementId={data.requirementId}
                    open={open}
                    setOpen={setOpen}
                    overridden={overridden}
                    setOverride={setOverride}
                />
                <Collapse in={open} unmountOnExit>
                    {showLabel && (
                        <p className="requirement-label">
                            <b>
                                Complete {label}
                                {groupByDepartment && 'courseCount' in data
                                    ? ` ${pluralize(data.courseCount, 'courses', 'course')}`
                                    : ' of the following'}
                                <CompletionHint data={data} takenCourseIDs={takenCourseIDs} />
                            </b>
                        </p>
                    )}
                    {geTransfers.length > 0 &&
                        geTransfers.map((ge, i) => <TransferCreditsTile key={i} transferredGE={ge} />)}
                    <RequirementCourseList
                        courses={data.courses}
                        takenCourseIDs={takenCourseIDs}
                        storeKey={`${storeKey}-dept`}
                    />
                </Collapse>
            </div>
        </GETransferBadge>
    );
};

interface CompletionHintProps {
    data: ProgramRequirement<'Course' | 'Unit'>;
    takenCourseIDs: CompletedCourseSet;
}

const CompletionHint: FC<CompletionHintProps> = ({ data, takenCourseIDs }) => {
    const showCourseCount = data.courses.length > 0 && 'courseCount' in data;
    const showUnitCount = 'unitCount' in data && data.unitCount > 0;
    const completedCount = useCompletionCheck(takenCourseIDs, data).completed;

    if (showCourseCount)
        return (
            <>
                {' '}
                • ({completedCount}/{data.courseCount})
            </>
        );
    if (showUnitCount)
        return (
            <>
                {' '}
                • ({completedCount}/{data.unitCount} units)
            </>
        );
    return null;
};

interface GroupedCourseRequirementProps {
    data: ProgramRequirement<'Course' | 'Unit'>;
    takenCourseIDs: CompletedCourseSet;
    storeKey: string;
}
const GroupedCourseRequirement: FC<GroupedCourseRequirementProps> = ({ data, takenCourseIDs, storeKey }) => {
    const complete = useCompletionCheck(takenCourseIDs, data).done;
    const className = `course-requirement${complete ? ' completed' : ''}`;

    return (
        <>
            <div className={className}>
                <p className="requirement-label">
                    <b>
                        {data.label}
                        <CompletionHint data={data} takenCourseIDs={takenCourseIDs} />
                    </b>
                </p>
                <RequirementCourseList
                    courses={data.courses}
                    takenCourseIDs={takenCourseIDs}
                    storeKey={`${storeKey}-dept`}
                />
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
    const isLoggedIn = useIsLoggedIn();
    const dispatch = useAppDispatch();

    const activePlanID = useAppSelector(selectCurrentPlan)?.id;

    const overridden = useAppSelector(
        (state) => state.courseRequirements.overriddenRequirements[activePlanID]?.[data.requirementId] ?? false
    );

    const setOverride = (override: boolean) => {
        if (!activePlanID) return;
        saveOverriddenRequirement(activePlanID, data.requirementId, override, isLoggedIn);
        dispatch(
            setRequirementOverride({ plannerId: activePlanID, requirement: data.requirementId, override: override })
        );
    };

    const setOpen = (isOpen: boolean) => {
        dispatch(setGroupExpanded({ storeKey: storeKey, expanded: isOpen }));
    };

    const className = `group-requirement${complete || overridden ? ' completed' : ''}`;

    const geTransfers = useMatchingGETransfers(data);
    const multipleApplicableTransfers = geTransfers.length > 1;

    return (
        <GETransferBadge transferredGEs={geTransfers} complete={complete}>
            <div className={className}>
                <GroupHeader
                    title={data.label}
                    requirementId={data.requirementId}
                    open={open}
                    setOpen={setOpen}
                    overridden={overridden}
                    setOverride={setOverride}
                />
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
                <Checkbox
                    name={'marker-' + storeKey}
                    checked={complete}
                    onChange={(e) => setComplete(e.target.checked)}
                />
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
                <GroupedCourseRequirement data={requirement} storeKey={storeKey} takenCourseIDs={takenCourseIDs} />
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
        .filter((course): course is PlannerCourseData => !isCustomCourse(course))
        .map((course) => [course.id, { units: course.minUnits }]);
    const transferCourseMap = transferredCourses.map((t) => [
        t.courseName.replace(/\s/g, ''),
        { units: t.units ?? 0, transferType: t.transferType },
    ]);

    const takenCourseSet: CompletedCourseSet = Object.assign(
        {},
        Object.fromEntries(roadmapCourseMap),
        Object.fromEntries(transferCourseMap)
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
