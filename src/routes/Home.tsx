import { useState } from 'react';
import { Box, Tab, Tabs, useMediaQuery } from '@mui/material';
import Calendar from '$components/Calendar';
import CourseSearch from '$components/CourseSearch';
import AddedCourses from '$components/AddedCourses';

/**
 * home page
 */
export default function Home() {
  const isMobileScreen = useMediaQuery('(max-width:750px)');
  const [mobileTab, setMobileTab] = useState(0);
  const [tab, setTab] = useState(0);

  /**
   * on mobile, switch between calendar and classes panel
   */
  function handleMobileTabChange(_event: React.SyntheticEvent, newValue: number) {
    setMobileTab(newValue);
  }

  /**
   * switch between tabs within the classes panel
   */
  function handleTabChange(_event: React.SyntheticEvent, newValue: number) {
    setTab(newValue);
  }

  /**
   * on mobile screen, only either the calendar or class panel can be visible at once
   */
  if (isMobileScreen) {
    return (
      <>
        <Tabs value={mobileTab} onChange={handleMobileTabChange} variant="fullWidth">
          <Tab label="Calendar" />
          <Tab label="Courses" />
        </Tabs>
        {mobileTab === 0 && <Calendar />}
        {mobileTab === 1 && (
          <Box>
            <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
              <Tab label="Course Search" />
              <Tab label="Added Courses" />
              <Tab label="Map" />
            </Tabs>
            {tab === 0 && <CourseSearch />}
            {tab === 1 && <AddedCourses />}
          </Box>
        )}
      </>
    );
  }

  /**
   * on larger than mobile, both panels are split
   */
  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ width: '50%', height: '90vh', overflowY: 'auto' }}>
        <Calendar />
      </Box>
      <Box sx={{ width: '50%', height: '90vh', overflowY: 'auto' }}>
        <Tabs value={tab} onChange={handleTabChange} variant="fullWidth">
          <Tab label="Course Search" />
          <Tab label="Added Courses" />
          <Tab label="Map" />
        </Tabs>
        {tab === 0 && <CourseSearch />}
        {tab === 1 && <AddedCourses />}
      </Box>
    </Box>
  );
}
