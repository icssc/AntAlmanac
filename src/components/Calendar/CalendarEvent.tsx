import { useSnackbar } from 'notistack';
import { Delete as DeleteIcon } from '@mui/icons-material';
import { Box, IconButton, Paper, Tooltip, Typography } from '@mui/material';
import { analyticsEnum, logAnalytics } from '$lib/analytics';
import { useScheduleStore } from '$stores/schedule';
import { deleteCourse } from '$stores/schedule/course';
import { deleteCustomEvent } from '$stores/schedule/custom';
import type { calendarizeCustomEvents, calendarizeCourseEvents } from '$stores/schedule/calendarize';
import CustomEventButton from '$components/Buttons/CustomEvent';
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
type CalendarCustomEvent = ReturnType<typeof calendarizeCustomEvents>[number];
type CalendarEvent = CalendarCourseEvent | CalendarCustomEvent;

interface CourseCalendarEventProps {
  courseInMoreInfo?: CalendarEvent | null;
  currentScheduleIndex: number;
  scheduleNames: string[];
  closePopover: () => void;
}

export default function CourseCalendarEvent(props: CourseCalendarEventProps) {
  const { currentSchedule } = useScheduleStore();
  const { enqueueSnackbar } = useSnackbar();

  const customEvents = currentSchedule().customEvents;

  const customEventID =
    props.courseInMoreInfo && 'customEventID' in props.courseInMoreInfo ? props.courseInMoreInfo.customEventID : null;

  const customEvent = customEventID != null ? customEvents.find((c) => c.customEventID === customEventID) : null;

  function clickToCopy(event: React.MouseEvent<HTMLElement, MouseEvent>, sectionCode: string) {
    event.stopPropagation();
    navigator.clipboard.writeText(sectionCode);
    enqueueSnackbar('Section code copied to clipboard', { variant: 'success' });
  }

  const { courseInMoreInfo, currentScheduleIndex } = props;

  if (courseInMoreInfo && !courseInMoreInfo.isCustomEvent && 'bldg' in courseInMoreInfo) {
    const { term, instructors, sectionCode, title, finalExam, bldg } = courseInMoreInfo;

    return (
      <Paper>
        <div>
          <span>{title}</span>
          <Tooltip title="Delete">
            <IconButton
              size="small"
              onClick={() => {
                deleteCourse(sectionCode, term);
                logAnalytics({
                  category: analyticsEnum.calendar.title,
                  action: analyticsEnum.calendar.actions.DELETE_COURSE,
                });
              }}
            >
              <DeleteIcon fontSize="inherit" />
            </IconButton>
          </Tooltip>
        </div>
        <table>
          <tbody>
            <tr>
              <td>Section code</td>
              <Tooltip title="Click to copy course code" placement="right">
                <td
                  onClick={(e) => {
                    logAnalytics({
                      category: analyticsEnum.calendar.title,
                      action: analyticsEnum.calendar.actions.COPY_COURSE_CODE,
                    });
                    clickToCopy(e, sectionCode);
                  }}
                >
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
                  color={courseInMoreInfo.color}
                  isCustomEvent={courseInMoreInfo.isCustomEvent}
                  sectionCode={courseInMoreInfo.sectionCode}
                  term={courseInMoreInfo.term}
                  analyticsCategory={analyticsEnum.calendar.title}
                />
              </td>
            </tr>
          </tbody>
        </table>
      </Paper>
    );
  } else if (courseInMoreInfo && 'customEventID' in courseInMoreInfo) {
    const { title, customEventID } = courseInMoreInfo;
    return (
      <Paper sx={{ padding: 2 }}>
        <Typography>{title}</Typography>
          <Box>
          <ColorPicker
            color={courseInMoreInfo.color || ''}
            isCustomEvent={true}
            customEventID={courseInMoreInfo.customEventID}
            analyticsCategory={analyticsEnum.calendar.title}
          />
          {customEvent && <CustomEventButton onDialogClose={props.closePopover} event={customEvent} />}
          <Tooltip title="Delete">
            <IconButton
              onClick={() => {
                props.closePopover();
                deleteCustomEvent(customEventID, [currentScheduleIndex]);
                logAnalytics({
                  category: analyticsEnum.calendar.title,
                  action: analyticsEnum.calendar.actions.DELETE_CUSTOM_EVENT,
                });
              }}
              size="large"
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>
      </Paper>
    );
  }
  return <div>Custom Event</div>;
}
