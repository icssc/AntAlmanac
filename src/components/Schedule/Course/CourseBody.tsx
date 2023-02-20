import { useSnackbar } from 'notistack'
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
} from '@mui/material'
import locations from '$lib/location_ids'
import { analyticsEnum } from '$lib/analytics'
import { useSearchStore } from '$stores/search'
import { useScheduleStore } from '$stores/schedule'
import AddCourseButton from '$components/Buttons/AddCourse'
import AddCourseMenuButton from '$components/Buttons/AddCourseMenu'
import DeleteCourseButton from '$components/Buttons/DeleteCourse'
import ColorPicker from '$components/Buttons/ColorPicker'
import type { AACourse, AASection } from '$lib/peterportal.types'

const restrictions: Record<string, string> = {
  A: 'A: Prerequisite required',
  M: 'M: Non-major only',
  E: 'E: Freshmen only',
  G: 'G: Lower-division only',
  I: 'I: Seniors only',
  N: 'N: School major only',
  F: 'F: Sophomores only',
  O: 'O: Non-school major only',
  H: 'H: Juniors only',
  J: 'J: Upper-division only',
  C: 'C: Fee required',
  D: 'D: Pass/Not Pass option only',
  X: 'X: Separate authorization codes required to add, drop, or change enrollment',
  R: 'R: Biomedical Pass/Fail course (School of Medicine only)',
  K: 'K: Graduate only',
  S: 'S: Satisfactory/Unsatisfactory only',
  B: 'B: Authorization code required',
  L: 'L: Major only',
}

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
}

const SectionStatusColors: Record<string, string> = {
  open: '#00c853',
  waitl: '#1c44b2',
  full: '#e53935',
}

/**
 * column 0
 * actions for managing the course, e.g. add, delete, change color, add to schedule #
 */
function CourseActions(props: { section: AASection; course: AACourse; term?: string }) {
  const { schedules, scheduleIndex } = useScheduleStore()
  const courses = schedules[scheduleIndex].courses
  const addedSectionCodes = new Set(courses.map((course) => `${course.section.sectionCode} ${course.term}`))
  const term = props.term || useSearchStore.getState()?.form?.term
  const alreadyAdded = addedSectionCodes.has(`${props.section.sectionCode} ${term}`)

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
  )
}

/**
 * column 1
 * section code that can be copied to clipboard on click
 */
function SectionCode(props: { section: AASection }) {
  const { enqueueSnackbar } = useSnackbar()
  const { section } = props

  function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault()
    if (window.isSecureContext) {
      navigator.clipboard.writeText(section.sectionCode.toString())
      enqueueSnackbar('Section code copied to clipboard', { variant: 'success' })
    }
  }

  return (
    <Link onClick={handleClick} underline="hover" href="#" variant="body2">
      {section.sectionCode}
    </Link>
  )
}

/**
 * column 2
 * information about the course type, units, etc.
 */
function CourseDetails(props: { section: AASection }) {
  const { section } = props
  return (
    <Box>
      <Typography variant="body2" whiteSpace="nowrap" color={SectionTypeColors[section.sectionType]}>
        {section.sectionType}
      </Typography>
      <Typography variant="body2" whiteSpace="nowrap">
        Sec: {section.sectionNum}
      </Typography>
      <Typography variant="body2" whiteSpace="nowrap">
        Units: {section.units}
      </Typography>
    </Box>
  )
}

/**
 * column 3
 * course instructors
 */
function CourseInstructors(props: { section: AASection }) {
  const { section } = props
  return (
    <Box>
      {section.instructors.map((instructor, index) => {
        const lastName = instructor.substring(0, instructor.indexOf(','))
        if (!lastName || lastName === 'STAFF') {
          return (
            <Typography key={index} variant="body2">
              {instructor}
            </Typography>
          )
        }
        return (
          <Box key={index}>
            <Link
              href={`https://www.ratemyprofessors.com/search/teachers?sid=U2Nob29sLTEwNzQ=&query=${lastName}`}
              target="_blank"
              rel="noopener noreferrer"
              variant="body2"
              whiteSpace="nowrap"
            >
              {instructor}
            </Link>
          </Box>
        )
      })}
    </Box>
  )
}

/**
 * column 5
 * course meeting days/times
 */
function CourseTimes(props: { section: AASection }) {
  const { section } = props
  return (
    <Box>
      {section.meetings.map((meeting, index) => (
        <Typography variant="body2" key={index}>
          {`${meeting.days} ${meeting.time.replace(/\s/g, '').split('-').join(' - ')}`}
        </Typography>
      ))}
    </Box>
  )
}

/**
 * column 6
 * meeting locations and links to the map
 */
function CoursePlaces(props: { section: AASection }) {
  const { section } = props
  return (
    <Box>
      {section.meetings.map((meeting, index) => {
        if (!meeting || meeting.bldg === 'TBA') {
          return (
            <Typography key={index} variant="body2">
              {meeting.bldg}
            </Typography>
          )
        }
        const location_id = locations[meeting.bldg.split(' ')[0] as keyof typeof locations]
        const href = location_id
          ? `https://map.uci.edu/?id=463#!m/${location_id}`
          : 'https://map.uci.edu/?id=463#!ct/12035,12033,11888,0,12034'
        return (
          <Link key={index} variant="body2" href={href} target="_blank" rel="noopener noreferrer" underline="hover">
            {meeting.bldg}
          </Link>
        )
      })}
    </Box>
  )
}

/**
 * column 7
 * course's current enrollment data
 */
function CourseEnrollment(props: { section: AASection }) {
  const { section } = props
  return (
    <Box>
      <Typography variant="body2">
        {section.numCurrentlyEnrolled.totalEnrolled}/{section.maxCapacity}
      </Typography>
      <Typography variant="body2">
        {section.numOnWaitlist && 'WL: '}
        {section.numOnWaitlist}
      </Typography>
      <Typography variant="body2">
        {section.numNewOnlyReserved && 'NOR: '}
        {section.numNewOnlyReserved}
      </Typography>
    </Box>
  )
}

/**
 * column 8
 * course's restrictions
 */
function CourseRestrictions(props: { section: AASection }) {
  const { section } = props
  return (
    <Box>
      <Tooltip
        title={section.restrictions
          .split(' ')
          .filter((r) => r !== 'and' && r !== 'or')
          .map((r, index) => (
            <Typography key={index}>{restrictions[r]}</Typography>
          ))}
      >
        <Link href="https://www.reg.uci.edu/enrollment/restrict_codes.html" target="_blank" rel="noopener noreferrer">
          {section.restrictions}
        </Link>
      </Tooltip>
    </Box>
  )
}

/**
 * clumn 9
 * course's current status, e.g. full, open
 */
function CourseStatus(props: { section: AASection }) {
  const { section } = props
  return (
    <Typography variant="body2" color={SectionStatusColors[section.status?.toLowerCase() || '']}>
      {section.status}
    </Typography>
  )
}

/**
 * renders a table showing everything about the course,
 * e.g. section code, instructors, times, enrollment status, etc.
 */
export default function CourseBody({ course, term }: { course: AACourse; term?: string }) {
  return (
    <TableContainer component={Paper} style={{ margin: '8px 0px 8px 0px' }} elevation={0} variant="outlined">
      <Table size="small" sx={{ '.MuiTableCell-root': { paddingX: 0, paddingY: 0.5 } }}>
        <TableHead>
          <TableRow>
            <TableCell width="4%" />
            <TableCell width="10%">Code</TableCell>
            <TableCell width="10%">Type</TableCell>
            <TableCell width="15%">Instructors</TableCell>
            <TableCell width="12%">Times</TableCell>
            <TableCell width="10%">Places</TableCell>
            <TableCell width="10%">Enrollment</TableCell>
            <TableCell width="8%">Rstr</TableCell>
            <TableCell width="8%">Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody sx={{ padding: 0 }}>
          {course.sections.map((section, index) => (
            <TableRow
              sx={{
                '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                '& .MuiTableCell-root': { padding: 0 },
              }}
              key={index}
            >
              <TableCell>
                <CourseActions section={section} course={course} term={term} />
              </TableCell>
              <TableCell>
                <SectionCode section={section} />
              </TableCell>
              <TableCell>
                <CourseDetails section={section} />
              </TableCell>
              <TableCell>
                <CourseInstructors section={section} />
              </TableCell>
              <TableCell>
                <CourseTimes section={section} />
              </TableCell>
              <TableCell>
                <CoursePlaces section={section} />
              </TableCell>
              <TableCell>
                <CourseEnrollment section={section} />
              </TableCell>
              <TableCell>
                <CourseRestrictions section={section} />
              </TableCell>
              <TableCell>
                <CourseStatus section={section} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
