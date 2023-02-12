import { Fragment } from 'react';
import { Add as AddIcon, ArrowDropDown as ArrowDropDownIcon, Help as HelpIcon } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
  useMediaQuery,
} from '@mui/material';
import type { AACourse, AASection } from '$types/peterportal';

const colors: Record<string, string> = {
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

function CourseActions(props: { section: AASection }) {
  return (
    <Box sx={{ display: 'flex', flexWrap: 'nowrap' }}>
      <IconButton>
        <AddIcon />
      </IconButton>
      <IconButton>
        <ArrowDropDownIcon />
      </IconButton>
    </Box>
  );
}

function SectionDetails(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      <Box>
        <Typography variant="caption" whiteSpace="nowrap" color={colors[section.sectionType]}>
          {section.sectionType}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" whiteSpace="nowrap">
          Sec: {section.sectionNum}
        </Typography>
      </Box>
      <Box>
        <Typography variant="caption" whiteSpace="nowrap">
          Units: {section.units}
        </Typography>
      </Box>
    </Box>
  );
}

function SectionCode(props: { section: AASection }) {
  const { section } = props;
  return <Typography variant="caption">{section.sectionCode}</Typography>;
}

function SectionInstructors(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      {section.instructors.map((instructor, index) => (
        <Box key={index}>
          <Typography variant="caption" whiteSpace="nowrap">
            {instructor}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}

function SectionTimes(props: { section: AASection }) {
  const { section } = props;
  return (
    <Box>
      {section.meetings.map((meeting, index) => (
        <Fragment key={index}>
          <Typography variant="caption" whiteSpace="nowrap" key={index}>
            {meeting.bldg}
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
      {section.meetings.map((meeting, index) => (
        <Fragment key={index}>
          <Typography variant="caption">{meeting.bldg}</Typography>
          <br />
        </Fragment>
      ))}
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
  return <Typography variant="caption">{section.restrictions}</Typography>;
}

function SectionStatus(props: { section: AASection }) {
  const { section } = props;
  return <Typography variant="caption">{section.status}</Typography>;
}

export default function SectionTable(props: { course: AACourse }) {
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
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography>Enrollment</Typography>
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
                  <HelpIcon fontSize="small" />
                </Tooltip>
              </Box>
            </TableCell>
            <TableCell>Rstr</TableCell>
            <TableCell>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {props.course.sections.map((section, index) => (
            <TableRow
              sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' }, '.MuiTableCell-root': { padding: 0 } }}
              key={index}
            >
              <TableCell>
                <CourseActions section={section} />
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
