import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';

import { useRef } from 'react';
import { Box, Paper, } from '@mui/material';
import Toolbar from './Toolbar';
import { Calendar, dayjsLocalizer, DateLocalizer, Views } from 'react-big-calendar';
import dayjs from 'dayjs';

const localizer = dayjsLocalizer(dayjs);

const MyCalendar = (props) => (
  <Calendar
    localizer={localizer}
    toolbar={false}
    formats={{
      timeGutterFormat: (date: Date, culture?: string, localizer?: DateLocalizer) =>
        date.getMinutes() > 0 || !localizer ? '' : localizer.format(date, 'h A', culture),
      dayFormat: 'ddd',
    }}
    defaultView={Views.WORK_WEEK}
    views={[Views.WEEK, Views.WORK_WEEK]}
    view={Views.WEEK}
    onView={() => {}}
    step={15}
    timeslots={2}
    defaultDate={new Date(2018, 0, 1)}
    min={new Date(2018, 0, 1, 7)}
    max={new Date(2018, 0, 1, 23)}
    showMultiDayTimes={false}
  />
);

export default function CCalendar() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Box>
      <Toolbar imgRef={ref} />
      <Paper ref={ref}>
        <MyCalendar />
      </Paper>
    </Box>
  );
}
