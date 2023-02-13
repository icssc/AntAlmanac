import { Fragment } from 'react';
import { useSnackbar } from 'notistack';
import {
  Box,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import type { AACourse, AASection } from '$types/peterportal';
import { useScheduleStore } from '$stores/schedule';
import { useSearchStore } from '$stores/search';
import locations from '$lib/locations';
import restrictions from '$lib/restrictions';
import AddCourseButton from '$components/Buttons/AddCourse';
import AddCourseMenuButton from '$components/Buttons/AddCourseMenu';
import DeleteCourseButton from '$components/Buttons/DeleteCourse';
import ColorPicker from '$components/ColorPicker';
import { analyticsEnum } from '$lib/analytics';

const SectionTypeColors: Record<string, string> = {
  Act: '#c87137',
  Col: '#ff40b5',
  Dis: '#8d63f0',
  Fld: '#1ac805',
  Lab: '#1abbe9',
  Lec: '#d40000',
  Qiz: '#8e5c41',
  Res: '#ff2466',
  Sem: '#2155ff',
  Stu: '#179523',
  Tap: '#8d2df0',
  Tut: '#ffc705',
};

const SectionStatusColors: Record<string, string> = {
  open: '#00c853',
  waitl: '#1c44b2',
  full: '#e53935',
};

function CourseActions(props: { section: AASection; course: AACourse; term?: string }) {
  const { schedules, scheduleIndex } = useScheduleStore();
  const courses = schedules[scheduleIndex].courses;
  const addedSectionCodes = new Set(courses.map((course) => `${course.section.sectionCode} ${course.term}`));
  const term = props.term || useSearchStore.getState()?.form?.term;
  const alreadyAdded = addedSectionCodes.has(`${props.section.sectionCode} ${term}`);

  return (
    <Box sx={{ display: 'flex', flexWrap: 'nowrap' }}>
      {alreadyAdded ? <DeleteCourseButton {...props} /> : <AddCourseButton {...props} />}
      {alreadyAdded ? (
        <ColorPicker
          color={props.section.color}
          sectionCode={props.section.sectionCode}
          analyticsCategory={analyticsEnum.addedClasses.title}
          term={term}
        />
      ) : (
        <AddCourseMenuButton {...props} />
      )}
    </Box>
  );
}

function SectionDetails(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      <Typography variant="caption" whiteSpace="nowrap" color={SectionTypeColors[section.sectionType]}>
        {section.sectionType}
      </Typography>
      <br />
      <Typography variant="caption" whiteSpace="nowrap">
        Sec: {section.sectionNum}
      </Typography>
      <br />
      <Typography variant="caption" whiteSpace="nowrap">
        Units: {section.units}
      </Typography>
    </Box>
  );
}

function SectionCode(props: { section: AASection }) {
  const { enqueueSnackbar } = useSnackbar();
  const { section } = props;

  function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault();
    if (window.isSecureContext) {
      navigator.clipboard.writeText(section.sectionCode.toString());
      enqueueSnackbar('Section code copied to clipboard', { variant: 'success' });
    }
  }

  return (
    <Link onClick={handleClick} underline="hover" href="#" variant="caption">
      {section.sectionCode}
    </Link>
  );
}

function SectionInstructors(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      {section.instructors.map((instructor, index) => {
        const lastName = instructor.substring(0, instructor.indexOf(','));
        if (!lastName || lastName === 'STAFF') {
          return (
            <Typography key={index} variant="caption">
              {instructor}
            </Typography>
          );
        }
        return (
          <Box key={index}>
            <Link
              href={`https://www.ratemyprofessors.com/search/teachers?sid=U2Nob29sLTEwNzQ=&query=${lastName}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="caption"
              whiteSpace="nowrap"
            >
              {instructor}
            </Link>
          </Box>
        );
      })}
    </Box>
  );
}

function SectionTimes(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      {section.meetings.map((meeting, index) => (
        <Fragment key={index}>
          <Typography variant="caption" key={index}>
            {`${meeting.days} ${meeting.time.replace(/\s/g, '').split('-').join(' - ')}`}
          </Typography>
          <br />
        </Fragment>
      ))}
    </Box>
  );
}

function SectionPlaces(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      {section.meetings.map((meeting, index) => {
        if (!meeting || meeting.bldg === 'TBA') {
          return (
            <Fragment key={index}>
              <Typography variant="caption">{meeting.bldg}</Typography>
              <br />
            </Fragment>
          );
        }
        const location_id = locations[meeting.bldg.split(' ')[0] as keyof typeof locations];
        const href = location_id
          ? `https://map.uci.edu/?id=463#!m/${location_id}`
          : 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034';
        return (
          <Fragment key={index}>
            <Link variant="caption" href={href} target="_blank" rel="noopener noreferrer" underline="hover">
              {meeting.bldg}
            </Link>
            <br />
          </Fragment>
        );
      })}
    </Box>
  );
}

function SectionEnrollment(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      <Typography variant="caption">
        {section.numCurrentlyEnrolled.totalEnrolled}/{section.maxCapacity}
      </Typography>
      <br />
      <Typography variant="caption">
        {section.numOnWaitlist && 'WL: '}
        {section.numOnWaitlist}
      </Typography>
      <br />
      <Typography variant="caption">
        {section.numNewOnlyReserved && 'NOR: '}
        {section.numNewOnlyReserved}
      </Typography>
    </Box>
  );
}

function SectionRestrictions(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      <Tooltip
        title={section.restrictions
          .split(' ')
          .filter((r) => r !== 'and' && r !== 'or')
          .map((r, index) => (
            <Fragment key={index}>
              <Typography>{restrictions[r]}</Typography>
            </Fragment>
          ))}
      >
        <Link href="https://www.reg.uci.edu/enrollment/restrict_codes.html" target="_blank" rel="noopener noreferrer">
          {section.restrictions}
        </Link>
      </Tooltip>
    </Box>
  );
}

function SectionStatus(props: { section: AASection }) {
  const { section } = props;
  return (
    <Typography variant="caption" color={SectionStatusColors[section.status?.toLowerCase() || '']}>
      {section.status}
    </Typography>
  );
}

export default function SectionBody({ course, term }: { course: AACourse; term?: string }) {
  return (
    <TableContainer component={Paper} style={{ margin: '8px 0px 8px 0px' }} elevation={0} variant="outlined">
      <Table size="small" sx={{ '.MuiTableCell-root': { padding: 1 } }}>
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Code</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Instructors</TableCell>
            <TableCell>Times</TableCell>
            <TableCell>Places</TableCell>
            <TableCell>
              <Tooltip
                title={
                  <Typography>
                    Enrolled / Capacity
                    <br />
                    Waitlist
                    <br />
                    New-Only Reserved
                  </Typography>
                }
              >
                <Typography>Enrollment</Typography>
              </Tooltip>
            </TableCell>
            <TableCell>Rstr</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {course.sections.map((section, index) => (
            <TableRow
              sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' }, '.MuiTableCell-root': { padding: 0 } }}
              key={index}
            >
              <TableCell>
                <CourseActions section={section} course={course} term={term} />
              </TableCell>
              <TableCell>
                <SectionCode section={section} />
              </TableCell>
              <TableCell>
                <SectionDetails section={section} />
              </TableCell>
              <TableCell>
                <SectionInstructors section={section} />
              </TableCell>
              <TableCell>
                <SectionTimes section={section} />
              </TableCell>
              <TableCell>
                <SectionPlaces section={section} />
              </TableCell>
              <TableCell>
                <SectionEnrollment section={section} />
              </TableCell>
              <TableCell>
                <SectionRestrictions section={section} />
              </TableCell>
              <TableCell>
                <SectionStatus section={section} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
