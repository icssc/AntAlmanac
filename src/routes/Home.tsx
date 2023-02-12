import { useState } from 'react';
import { Box, Tab, Tabs, useMediaQuery } from '@mui/material';
import Calendar from '$components/Calendar';
import ClassSearch from '$components/ClassSearch/ClassSearch';

/**
 * home page
 */
export default function Home() {
  const isMobileScreen = useMediaQuery('(max-width:750px)');
  const [value, setValue] = useState(0);

  function handleChange(_event: React.SyntheticEvent, newValue: number) {
    setValue(newValue);
  }

  if (isMobileScreen) {
    return (
      <>
        <Tabs value={value} onChange={handleChange} variant="fullWidth">
          <Tab label="Item One" />
          <Tab label="Item Two" />
        </Tabs>
        {value === 0 && <Calendar />}
        {value === 1 && <ClassSearch />}
      </>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Box sx={{ width: '50%', height: '90vh', overflowY: 'auto' }}>
        <Calendar />
      </Box>
      <Box sx={{ width: '50%', height: '90vh', overflowY: 'auto' }}>
        <ClassSearch />
      </Box>
    </Box>
  );
}
