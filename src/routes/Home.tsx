import { Box, Button } from '@mui/material';
import Header from '$components/Header';
import Actions from '$components/Actions';
import Calendar from '$components/Calendar';
import { useScheduleStore } from '$stores/schedule';
import { setScheduleIndex, addSchedule, deleteCurrentSchedule } from '$stores/schedule/schedule';
import { addCourseToAllSchedules } from '$stores/schedule/course';

let count = 0;

/**
 * home page
 */
export default function Home() {
  const { schedules, scheduleIndex } = useScheduleStore();

  function handleIncrement() {
    setScheduleIndex(scheduleIndex + 1);
  }

  function handleDecrement() {
    setScheduleIndex(scheduleIndex - 1);
  }

  function handleAddSchedule() {
    addSchedule(`Schedule: ${scheduleIndex + 2}`);
  }

  function handleDelete() {
    deleteCurrentSchedule();
  }

  function handleAddCourse() {
    addCourseToAllSchedules({
      courseComment: '',
      courseNumber: '', // e.g. 122a
      courseTitle: '',
      deptCode: '',
      prerequisiteLink: '',
      section: {
        sectionCode: (++count).toString(),
        sectionType: '',
        sectionNum: '',
        units: '',
        instructors: [''],
        meetings: [],
        finalExam: '',
        maxCapacity: '',
        numCurrentlyEnrolled: {
          totalEnrolled: '',
          sectionEnrolled: '',
        },
        numOnWaitlist: '',
        numRequested: '',
        numNewOnlyReserved: '',
        restrictions: '',
        status: '',
        sectionComment: '',
        color: 'blue',
      },
      term: '',
    });
  }

  return (
    <>
      <Header />
      <Actions />
      <Calendar />
      <Button onClick={handleIncrement} variant="contained">
        Increment Schedule Index
      </Button>
      <Button onClick={handleDecrement} variant="contained">
        Decrement Schedule Index
      </Button>
      <Button onClick={handleAddSchedule} variant="contained">
        Add Schedule
      </Button>
      <Button onClick={handleDelete} variant="contained">
        Delete Current Schedule
      </Button>
      <Button onClick={handleAddCourse} variant="contained">
        Add Course to All
      </Button>
      <Box>{JSON.stringify(schedules)}</Box>
      <Box>{scheduleIndex}</Box>
    </>
  );
}
