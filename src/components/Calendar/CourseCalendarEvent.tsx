import { useSnackbar } from 'notistack';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { IconButton, Paper, Tooltip } from '@mui/material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { deleteCourse } from '$stores/schedule/course';
import type { calendarizeCourseEvents } from '$stores/schedule/calendarize';
import ColorPicker from '$components/ColorPicker';
import locations from './locations';

function genMapLink(location: string) {
  try {
    const location_id = locations[location.split(' ')[0] as keyof typeof locations];
    return `https://map.uci.edu/?id=463#!m/${location_id}`;
  } catch (err) {
    return 'https://map.uci.edu/';
  }
}

type CalendarCourseEvent = ReturnType<typeof calendarizeCourseEvents>[number];

interface CourseCalendarEventProps {
  event: CalendarCourseEvent;
  closePopover: () => void;
}

export default function CourseCalendarEvent(props: CourseCalendarEventProps) {
  const { term, instructors, sectionCode, title, finalExam, bldg } = props.event;
  const { enqueueSnackbar } = useSnackbar();

  function handleClickCopy(e: React.MouseEvent<HTMLElement, MouseEvent>) {
    e.stopPropagation();
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
    <Paper>
      <div>
        <span>{title}</span>
        <Tooltip title="Delete">
          <IconButton size="small" onClick={handleDelete}>
            <DeleteIcon fontSize="inherit" />
          </IconButton>
        </Tooltip>
      </div>
      <table>
        <tbody>
          <tr>
            <td>Section code</td>
            <Tooltip title="Click to copy course code" placement="right">
              <td onClick={handleClickCopy}>
                <u>{sectionCode}</u>
              </td>
            </Tooltip>
          </tr>
          <tr>
            <td>Term</td>
            <td>{term}</td>
          </tr>
          <tr>
            <td>Instructors</td>
            <td>{instructors.join('\n')}</td>
          </tr>
          <tr>
            <td>Location</td>
            <td>
              {bldg !== 'TBA' ? (
                <a href={genMapLink(bldg)} target="_blank" rel="noopener noreferrer">
                  {bldg}
                </a>
              ) : (
                bldg
              )}
            </td>
          </tr>
          <tr>
            <td>Final</td>
            <td>{finalExam}</td>
          </tr>
          <tr>
            <td>Color</td>
            <td>
              <ColorPicker
                color={props.event.color}
                isCustomEvent={props.event.isCustomEvent}
                sectionCode={props.event.sectionCode}
                term={props.event.term}
                analyticsCategory={analyticsEnum.calendar.title}
              />
            </td>
          </tr>
        </tbody>
      </table>
    </Paper>
  );
}
