import { useSnackbar } from 'notistack';
import { Delete as DeleteIcon } from '@mui/icons-material';
import {
  Box,
  IconButton,
  Link,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { deleteCourse } from '$stores/schedule/course';
import type { getCourseCalendarEvents } from '$stores/schedule/calendar';
import ColorPicker from '$components/Buttons/ColorPicker';
import locations from '$lib/locations';

function genMapLink(location: string) {
  try {
    const location_id = locations[location.split(' ')[0] as keyof typeof locations];
    return `https://map.uci.edu/?id=463#!m/${location_id}`;
  } catch (err) {
    return 'https://map.uci.edu/';
  }
}

type CalendarCourseEvent = ReturnType<typeof getCourseCalendarEvents>[number];

interface CourseCalendarEventProps {
  event: CalendarCourseEvent;
  closePopover: () => void;
}

export default function CourseCalendarEvent(props: CourseCalendarEventProps) {
  const { term, instructors, sectionCode, title, finalExam, bldg } = props.event;
  const { enqueueSnackbar } = useSnackbar();

  function handleClickCopy(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.stopPropagation();
    e.preventDefault();
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.COPY_COURSE_CODE,
    });
    navigator.clipboard.writeText(sectionCode);
    enqueueSnackbar('Section code copied to clipboard', { variant: 'success' });
  }

  function handleDelete() {
    deleteCourse(sectionCode, term);
    logAnalytics({
      category: analyticsEnum.calendar.title,
      action: analyticsEnum.calendar.actions.DELETE_COURSE,
    });
  }

  return (
    <Paper sx={{ padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography>{title}</Typography>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={handleDelete}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </Box>
      <TableContainer>
        <Table size="small" sx={{ '.MuiTableCell-root': { paddingX: 0, paddingY: 0.5, border: 'none' }, padding: 0 }}>
          <TableBody>
            <TableRow>
              <TableCell>Section code</TableCell>
              <Tooltip title="Click to copy course code" placement="right">
                <TableCell align="right">
                  <Link href="#" onClick={handleClickCopy}>
                    {sectionCode}
                  </Link>
                </TableCell>
              </Tooltip>
            </TableRow>
            <TableRow>
              <TableCell>Term</TableCell>
              <TableCell align="right">{term}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Instructors</TableCell>
              <TableCell align="right">{instructors.join('\n')}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Location</TableCell>
              <TableCell align="right">
                {bldg !== 'TBA' ? (
                  <Link href={genMapLink(bldg)} target="_blank" rel="noopener noreferrer">
                    {bldg}
                  </Link>
                ) : (
                  <Typography>bldg</Typography>
                )}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Final</TableCell>
              <TableCell align="right">{finalExam}</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Color</TableCell>
              <TableCell align="right">
                <ColorPicker
                  color={props.event.color}
                  isCustomEvent={props.event.isCustomEvent}
                  sectionCode={props.event.sectionCode}
                  analyticsCategory={analyticsEnum.calendar.title}
                  term={term}
                />
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
}
