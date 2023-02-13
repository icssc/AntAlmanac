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

  function handleMobileChange(_event: React.SyntheticEvent, newValue: number) {
    setMobileTab(newValue);
  }

  function handleChange(_event: React.SyntheticEvent, newValue: number) {
    setTab(newValue);
  }

  if (isMobileScreen) {
    return (
      <>
        <Tabs value={mobileTab} onChange={handleMobileChange} variant="fullWidth">
          <Tab label="Item One" />
          <Tab label="Item Two" />
        </Tabs>
        {mobileTab === 0 && <Calendar />}
        {mobileTab === 1 && (
          <Box>
            <Tabs value={tab} onChange={handleChange} variant="fullWidth">
              <Tab label="Course Search" />
              <Tab label="Added Classes" />
              <Tab label="Map" />
            </Tabs>
            {tab === 0 && <CourseSearch />}
            {tab === 1 && <AddedCourses />}
          </Box>
        )}
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ width: '50%', height: '90vh', overflowY: 'auto' }}>
        <Calendar />
      </Box>
      <Box sx={{ width: '50%', height: '90vh', overflowY: 'auto' }}>
        <Tabs value={tab} onChange={handleChange} variant="fullWidth">
          <Tab label="Course Search" />
          <Tab label="Added Classes" />
          <Tab label="Map" />
        </Tabs>
        {tab === 0 && <CourseSearch />}
        {tab === 1 && <AddedCourses />}
      </Box>
    </Box>
  );
}
