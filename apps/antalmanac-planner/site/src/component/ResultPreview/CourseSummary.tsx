import './CourseSummary.scss';
import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckIcon from '@mui/icons-material/Check';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip } from '@mui/material';
import { formatPrerequisite } from '@packages/anteater-api/utils';
import { CoursePreview, PrerequisiteNode } from '@peterportal/types';
import { FC, useState } from 'react';

import { getMissingPrerequisites } from '../../helpers/planner';
import { isRoadmapVerifiablePrerequisite } from '../../helpers/prerequisites';
import { addDelimiter, getCourseTags } from '../../helpers/util';
import { useClearedCoursesUntil } from '../../hooks/planner';
import { useAppSelector } from '../../store/hooks';
import { selectCurrentPlan } from '../../store/slices/roadmapSlice';
import { CourseGQLData } from '../../types/types';
import PrereqTree from '../PrereqTree/PrereqTree';
import RecentOfferingsTable from '../RecentOfferingsTable/RecentOfferingsTable';

const CourseTags: FC<{ course: CourseGQLData }> = ({ course }) => {
    const tags = getCourseTags(course);
    return (
        <div className="course-tags">
            {tags.map((tag) => (
                <Chip label={tag} key={tag} />
            ))}
        </div>
    );
};

const CourseRestriction: FC<{ restriction: string }> = ({ restriction }) => {
    return (
        <>
            <h4>Restrictions</h4>
            <p>
                <i>{restriction || 'There are no restrictions for this course.'}</i>
            </p>
            {/* Restriction Tags are term-specific and needs a WebSoC query */}
        </>
    );
};

const PrereqItemText: FC<{ item: PrerequisiteNode; wrapInParens?: boolean }> = ({ item, wrapInParens }) => {
    if ('prereqType' in item) return <b>{formatPrerequisite(item)}</b>;

    let result = null;
    if (item.AND) {
        result = addDelimiter(
            item.AND.map((req, i) => <PrereqItemText item={req} key={i} wrapInParens />),
            ' and '
        );
    } else if (item.OR) {
        result = addDelimiter(
            item.OR.map((req, i) => <PrereqItemText item={req} key={i} wrapInParens />),
            ' or '
        );
    } else if (item.NOT) {
        result = addDelimiter(
            item.NOT.map((req, i) => <PrereqItemText item={req} key={i} wrapInParens />),
            ' or '
        );
        // parenthesize if more than 1 forbidden
        result = item.NOT.length > 1 ? <>NOT ({result})</> : <>NOT {result}</>;
    }

    if (wrapInParens) result = <>({result})</>;
    return result;
};

const CoursePrequisiteLine: FC<{
    item: PrerequisiteNode;
    clearedCourses: Set<string>;
    isCHC: boolean;
    negated?: boolean;
}> = ({ item, clearedCourses, isCHC, negated = false }) => {
    const verifiable = isRoadmapVerifiablePrerequisite(item);
    const requirementMissing = Boolean(getMissingPrerequisites(clearedCourses, { AND: [item] }, { isCHC }));
    const complete = negated ? requirementMissing : !requirementMissing;

    const title = complete
        ? negated
            ? 'Your roadmap does not contain this disallowed prerequisite'
            : 'You have completed this prerequisite'
        : negated
          ? 'Your roadmap contains this disallowed prerequisite'
          : 'This prerequisite is incomplete';

    const offset = [0, -8];
    const modifiers = [{ name: 'offset', options: { offset } }];
    const slotProps = { popper: { modifiers } };

    const icon = verifiable ? (
        <Tooltip title={title} placement="left" slotProps={slotProps}>
            {complete ? <CheckIcon /> : <WarningAmberIcon />}
        </Tooltip>
    ) : (
        <Tooltip title="Planner cannot verify this prerequisite yet" placement="left" slotProps={slotProps}>
            <QuestionMarkIcon />
        </Tooltip>
    );

    const iconStatus = verifiable ? (complete ? 'complete' : 'incomplete') : 'unverifiable';

    return (
        <li className="prerequisite-line">
            <span className={`icon icon-${iconStatus}`}>{icon}</span> <PrereqItemText item={item} />
        </li>
    );
};

/**
 * A list view of course prerequisites that also performs checks against the current planner
 */
const CoursePrerequisiteListView: FC<{
    tree: CourseGQLData['prerequisiteTree'];
    clearedCourses: Set<string>;
    isCHC: boolean;
}> = ({ tree, clearedCourses, isCHC }) => {
    const groups = [
        { type: 'AND' as const, label: 'All of the following:', items: tree.AND },
        { type: 'OR' as const, label: 'Any of the following:', items: tree.OR },
        { type: 'NOT' as const, label: 'None of the following:', items: tree.NOT },
    ].filter((group) => group.items?.length);

    return (
        <>
            <h4>Prerequisites</h4>
            {groups.length ? (
                groups.map((group) => (
                    <div key={group.type}>
                        <p className="summary-prerequisite-type">
                            <b>{group.label}</b>
                        </p>
                        <ul className="summary-prerequisites">
                            {group.items?.map((requirement, idx) => (
                                <CoursePrequisiteLine
                                    key={idx}
                                    item={requirement}
                                    clearedCourses={clearedCourses}
                                    isCHC={isCHC}
                                    negated={group.type === 'NOT'}
                                />
                            ))}
                        </ul>
                    </div>
                ))
            ) : (
                <p className="summary-prerequisite-type">This course has no prerequisites.</p>
            )}
        </>
    );
};

const CourseDependentText: FC<{ courseName: string; dependents: CoursePreview[] }> = ({ courseName, dependents }) => {
    const header = <h4>Required By</h4>;

    if (!dependents.length) {
        return (
            <>
                {header}
                <p>
                    <i>There are no courses that have {courseName} as a prerequisite.</i>
                </p>
            </>
        );
    }

    const MAX_SHOW_COUNT = 10;
    const shown = dependents.slice(0, MAX_SHOW_COUNT).map((course) => `${course.department} ${course.courseNumber}`);
    const omitCount = dependents.length - MAX_SHOW_COUNT;

    return (
        <>
            {header}
            <p>
                <i>You must take {courseName} before taking any of the following courses.</i>
            </p>
            <p>
                {shown.join(', ')}
                {omitCount > 0 && (
                    <>
                        , <i>{omitCount} more...</i>
                    </>
                )}
            </p>
        </>
    );
};

const PrerequisiteTreeDialog: FC<{ course: CourseGQLData }> = ({ course }) => {
    const [open, setOpen] = useState(false);

    const tree = course.prerequisiteTree;
    const hasNoDependents = Object.keys(course.dependents).length === 0;
    const hasNoPrereqs = !tree.AND?.length && !tree.OR?.length && !tree.NOT?.length;

    if (hasNoDependents && hasNoPrereqs) return null;

    return (
        <>
            <Button startIcon={<AccountTreeIcon />} variant="contained" onClick={() => setOpen(true)}>
                Full Prerequisite Tree
            </Button>
            <Dialog open={open} onClose={() => setOpen(false)} maxWidth="lg">
                <DialogTitle>🌲 Prerequisite Tree</DialogTitle>
                <DialogContent>
                    <PrereqTree {...course} />
                </DialogContent>
                <DialogActions>
                    <Button variant="text" color="inherit" onClick={() => setOpen(false)}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

const CourseSummary: FC<{ course: CourseGQLData }> = ({ course }) => {
    const courseId = `${course.department} ${course.courseNumber}`;
    const clearedCourses = useClearedCoursesUntil(courseId);
    const isCHC = Boolean(useAppSelector(selectCurrentPlan)?.chc);
    return (
        <div className="course-summary">
            <p>{course.description}</p>
            <CourseTags course={course} />
            <div className="summary-columns">
                <div className="summary-column">
                    <RecentOfferingsTable terms={course.terms} size="wide" />
                    <br />
                    <CourseRestriction restriction={course.restriction} />
                </div>
                <div className="summary-column">
                    <CoursePrerequisiteListView
                        tree={course.prerequisiteTree}
                        clearedCourses={clearedCourses}
                        isCHC={isCHC}
                    />
                    <br />
                    <CourseDependentText
                        courseName={`${course.department} ${course.courseNumber}`}
                        dependents={Object.values(course.dependents)}
                    />
                    <PrerequisiteTreeDialog course={course} />
                </div>
            </div>
        </div>
    );
};

export default CourseSummary;
