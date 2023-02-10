import { Box, Typography } from '@mui/material';
import { useScheduleStore } from '$stores/schedule';

export default function Calendar() {
  const { schedules, scheduleIndex, currentSchedule } = useScheduleStore();
  return (
    <Box>
      <Box>
        <Typography variant="h3">Current Schedule Index</Typography>
        <Typography variant="body1">{scheduleIndex}</Typography>
      </Box>
      <Box>
        <Typography variant="h3">Current Schedules</Typography>
        <Box>
          {schedules.map((schedule, index) => (
            <Typography key={index}>{JSON.stringify(schedule, null, 2)}</Typography>
          ))}
        </Box>
      </Box>
      <Box>
        Current Schedule:
        {JSON.stringify(currentSchedule())}
      </Box>
    </Box>
  );
}
