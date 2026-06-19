import './CourseSummary.scss';
import { FC, useState } from 'react';
import RecentOfferingsTable from '../RecentOfferingsTable/RecentOfferingsTable';
import { CourseGQLData } from '../../types/types';
import { CoursePreview, PrerequisiteNode } from '@peterportal/types';
import { Button, Chip, Dialog, DialogActions, DialogContent, DialogTitle, Tooltip } from '@mui/material';
import { useClearedCoursesUntil } from '../../hooks/planner';
import { getMissingPrerequisites } from '../../helpers/planner';

import AccountTreeIcon from '@mui/icons-material/AccountTree';
import CheckIcon from '@mui/icons-material/Check';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import { addDelimiter, getCourseTags } from '../../helpers/util';
import PrereqTree from '../PrereqTree/PrereqTree';

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
  if ('prereqType' in item) return <b>{'courseId' in item ? item.courseId : item.examName}</b>;

  let result = null;
  if (item.AND) {
    result = addDelimiter(
      item.AND.map((req, i) => <PrereqItemText item={req} key={i} wrapInParens />),
      ' and ',
    );
  } else if (item.OR) {
    result = addDelimiter(
      item.OR.map((req, i) => <PrereqItemText item={req} key={i} wrapInParens />),
      ' or ',
    );
  } else if (item.NOT) {
    result = addDelimiter(
      item.NOT.map((req, i) => <PrereqItemText item={req} key={i} wrapInParens />),
      ' or ',
    );
    // parenthesize if more than 1 forbidden
    result = item.NOT.length > 1 ? <>NOT ({result})</> : <>NOT {result}</>;
  }

  if (wrapInParens) result = <>({result})</>;
  return result;
};

const CoursePrequisiteLine: FC<{ item: PrerequisiteNode; clearedCourses: Set<string> }> = ({
  item,
  clearedCourses,
}) => {
  let complete = !getMissingPrerequisites(clearedCourses, { AND: [item] });
  if ('NOT' in item) {
    // if we are NOT missing any disallowed prerequisites, that means they are in the planner
    const forbiddenCoursesPresent = !getMissingPrerequisites(clearedCourses, { OR: item.NOT });
    complete = !forbiddenCoursesPresent;
  }

  let title = 'You have completed this prerequisite';
  if (!complete) {
    title = 'NOT' in item ? 'Your roadmap contains one of these disallowed courses' : 'This prerequisite is incomplete';
  }

  const offset = [0, -8];
  const modifiers = [{ name: 'offset', options: { offset } }];
  const slotProps = { popper: { modifiers } };

  const icon = (
    <Tooltip title={title} placement="left" slotProps={slotProps}>
      {complete ? <CheckIcon /> : <WarningAmberIcon />}
    </Tooltip>
  );

  return (
    <li className="prerequisite-line">
      <span className={'icon ' + (complete ? 'icon-complete' : 'icon-incomplete')}>{icon}</span>{' '}
      <PrereqItemText item={item} />
    </li>
  );
};

/**
 * A list view of course prerequisites that also performs checks against the current planner
 */
const CoursePrerequisiteListView: FC<{ tree: CourseGQLData['prerequisiteTree']; clearedCourses: Set<string> }> = ({
  tree,
  clearedCourses,
}) => {
  let listLabel = 'All of the following:';
  if (tree.OR) listLabel = 'Any of the following:';
  else if (tree.NOT) listLabel = 'None of the following:';

  const items = tree.AND ?? tree.OR ?? tree.NOT ?? [];

  return (
    <>
      <h4>Prerequisites</h4>
      <p className="summary-prerequisite-type">
        {items.length > 0 ? <b>{listLabel}</b> : 'This course has no prerequisites.'}
      </p>
      <ul className="summary-prerequisites">
        {items.map((requirement, idx) => (
          <CoursePrequisiteLine key={idx} item={requirement} clearedCourses={clearedCourses} />
        ))}
      </ul>
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
          <CoursePrerequisiteListView tree={course.prerequisiteTree} clearedCourses={clearedCourses} />
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
