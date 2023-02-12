import { useState } from 'react';
import { IconButton, Menu, MenuItem } from '@mui/material';
import { ArrowDropDown as ArrowDropDownIcon } from '@mui/icons-material';
import type { AASection, AACourse } from '$types/peterportal';
import { useScheduleStore } from '$stores/schedule';
import { addCourse, addCourseToAllSchedules } from '$stores/schedule/course';

export interface CourseDetails {
  deptCode: string;
  courseNumber: string;
  courseTitle: string;
  courseComment: string;
  prerequisiteLink: string;
}

interface Props {
  section: AASection;
  course: AACourse;
}

export default function AddCourseMenuButton({ section, course }: Props) {
  const schedules = useScheduleStore((store) => store.schedules);
  const scheduleNames = schedules.map((schedule) => schedule.scheduleName);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  function handleClick(event: React.MouseEvent<HTMLElement>) {
    setAnchorEl(event.currentTarget);
  }

  function handleClose() {
    setAnchorEl(null);
  }

  /**
   * returns function that will add a course to the specified index
   */
  function handleAdd(index: number) {
    return () => {
      addCourse(section, course, index);
    };
  }

  function handleAddAll() {
    addCourseToAllSchedules(section, course);
  }

  return (
    <>
      <IconButton onClick={handleClick}>
        <ArrowDropDownIcon />
      </IconButton>
      <Menu open={!!anchorEl} anchorEl={anchorEl} onClose={handleClose}>
        {scheduleNames.map((scheduleName, index) => (
          <MenuItem key={index} onClick={handleAdd(index)}>
            {scheduleName}
          </MenuItem>
        ))}
        <MenuItem onClick={handleAddAll}>Add to all schedules</MenuItem>
      </Menu>
    </>
  );
}
